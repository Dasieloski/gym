"use client";

import { useState } from 'react';
import { User, Eye, EyeOff, ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthCard from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) {
                alert("La foto debe ser menor de 1 megabyte.");
                setSelectedFile(null);
                setPreviewImage(null);
                return;
            }
            const extension = file.name.split('.').pop()?.toLowerCase();
            const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif'];

            if (!extension || !extensionesPermitidas.includes(extension)) {
                alert("El archivo debe ser una imagen con extensión jpg, jpeg, png o gif.");
                setSelectedFile(null);
                setPreviewImage(null);
                return;
            }

            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreviewImage(null);
        }
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            setIsLoading(true);

            if (!selectedFile) {
                alert("Debe subir una foto de perfil.");
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const error = await uploadRes.json();
                throw new Error(error.error || 'Error al subir la imagen');
            }

            const { url: imageUrl } = await uploadRes.json();

            const userData = {
                ...data,
                foto: imageUrl
            };

            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify(userData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                router.push('/login/inicio');
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error en el registro");
            }
        } catch (error) {
            console.error("Error al registrar:", error);
            alert(error instanceof Error ? error.message : "Ocurrió un error al registrar el usuario.");
        } finally {
            setIsLoading(false);
        }
    });

    const validateCarnetIdentidad = (value: string) => {
        return /^\d{11}$/.test(value) || "El carnet de identidad debe ser un número de 11 dígitos.";
    };

    const validateTelefono = (value: string) => {
        return /^\+53\d{8}$/.test(value) || "El teléfono debe comenzar con +53 y tener 11 dígitos en total.";
    };

    return (
        <div className="w-full max-w-lg relative z-10 pb-4 px-2">
            <div className="-mb-3 md:mb-0">
                <AuthHeader />
            </div>

            <AuthCard className="max-w-lg p-4 md:p-6">
                <h2 className="text-xl md:text-3xl font-heading font-bold text-white mb-0.5 tracking-tight">Registrarse</h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-sans mb-3 md:mb-5">Únete a la familia Gimnasio</p>

                <form className="space-y-2 md:space-y-3" onSubmit={onSubmit}>
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center mb-1 md:mb-2">
                        <label className="block text-[10px] md:text-xs font-medium font-sans text-white/40 mb-1 md:mb-1.5">
                            Foto de perfil
                        </label>
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white/[0.03] border-2 border-white/10 hover:border-[#02F5D4] transition-all duration-300 group/photo cursor-pointer">
                            {previewImage ? (
                                <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Camera className="text-slate-400 group-hover/photo:text-[#02F5D4] group-hover/photo:scale-110 transition-all duration-300" size={24} />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/20 to-[#2272FF]/20 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                        {selectedFile === null && <p className="text-red-400/80 text-[10px] mt-1 font-sans">Foto requerida</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        {/* Full Name */}
                        <div className="group/input">
                            <label htmlFor="nombre" className="block text-[10px] md:text-xs font-medium font-sans text-white/40 mb-1 md:mb-1.5">
                                Nombre completo
                            </label>
                            <AuthInput
                                id="nombre"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                                type="text"
                                placeholder="Juan Pérez"
                            />
                            {errors.nombre && <p className="text-red-400/80 text-[10px] mt-1 font-sans">{errors.nombre.message as string}</p>}
                        </div>

                        {/* Username */}
                        <div className="group/input">
                            <label htmlFor="username" className="block text-xs font-medium font-sans text-white/40 mb-1.5">
                                Username
                            </label>
                            <AuthInput
                                id="username"
                                {...register("username", { required: "El username es obligatorio" })}
                                type="text"
                                placeholder="juan23"
                            />
                            {errors.username && <p className="text-red-400/80 text-[10px] mt-1 font-sans">{errors.username.message as string}</p>}
                        </div>

                        {/* Sex */}
                        <div className="group/input">
                            <label htmlFor="sexo" className="block text-[10px] md:text-xs font-medium font-sans text-white/40 mb-1 md:mb-1.5">
                                Sexo
                            </label>
                            <select
                                id="sexo"
                                {...register("sexo", { required: "El sexo es obligatorio" })}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-[#02F5D4] focus:ring-2 focus:ring-[#02F5D4]/20 focus:outline-none transition-all duration-300"
                            >
                                <option value="" className="bg-[#050505]">Seleccionar</option>
                                <option value="MASCULINO" className="bg-[#050505]">Masculino</option>
                                <option value="FEMENINO" className="bg-[#050505]">Femenino</option>
                                <option value="OTRO" className="bg-[#050505]">Otro</option>
                            </select>
                            {errors.sexo && <p className="text-red-400/80 text-[10px] mt-1 font-sans">{errors.sexo.message as string}</p>}
                        </div>

                        {/* ID Card */}
                        <div className="group/input">
                            <label htmlFor="carnetIdentidad" className="block text-[10px] md:text-xs font-medium font-sans text-white/40 mb-1 md:mb-1.5">
                                Carnet de identidad
                            </label>
                            <AuthInput
                                id="carnetIdentidad"
                                {...register("carnetIdentidad", { required: "El carnet es obligatorio", validate: validateCarnetIdentidad })}
                                type="text"
                                placeholder="98765432100"
                            />
                            {errors.carnetIdentidad && <p className="text-red-400/80 text-[10px] mt-1 font-sans">{errors.carnetIdentidad.message as string}</p>}
                        </div>

                        {/* Phone */}
                        <div className="group/input">
                            <label htmlFor="telefono" className="block text-[10px] md:text-xs font-medium font-sans text-white/40 mb-1 md:mb-1.5">
                                Teléfono
                            </label>
                            <AuthInput
                                id="telefono"
                                {...register("telefono", { required: "El teléfono es obligatorio", validate: validateTelefono })}
                                type="tel"
                                placeholder="+53 54321000"
                            />
                            {errors.telefono && <p className="text-red-400/80 text-[10px] mt-1 font-sans">{errors.telefono.message as string}</p>}
                        </div>

                        {/* Email (Optional) */}
                        <div className="group/input hidden md:block">
                            <label htmlFor="email" className="block text-xs font-medium font-sans text-white/40 mb-1.5">
                                Correo (opcional)
                            </label>
                            <AuthInput
                                id="email"
                                {...register("email")}
                                type="email"
                                placeholder="juan@email.com"
                            />
                        </div>

                        {/* Instagram (Optional) */}
                        <div className="group/input hidden md:block">
                            <label htmlFor="instagram" className="block text-xs font-medium font-sans text-white/40 mb-1.5">
                                Instagram (opcional)
                            </label>
                            <AuthInput
                                id="instagram"
                                {...register("instagram")}
                                type="text"
                                placeholder="@usuario"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group/input">
                        <label htmlFor="password" className="block text-[10px] md:text-xs font-medium font-sans text-white/40 mb-1 md:mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <AuthInput
                                id="password"
                                {...register("password", { required: "La contraseña es obligatoria" })}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#02F5D4] transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400/80 text-[10px] mt-1 font-sans">{errors.password.message as string}</p>}
                    </div>

                    <div className="pt-1 md:pt-2">
                        <AuthButton
                            type="submit"
                            isLoading={isLoading}
                            icon={<User size={16} />}
                        >
                            {isLoading ? 'Registrando...' : 'Registrarse'}
                        </AuthButton>
                    </div>
                </form>

                <div className="mt-2 md:mt-4 text-center border-t border-white/5 pt-2 md:pt-3">
                    <p className="text-xs text-slate-400 font-sans">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login/inicio" className="text-[#02F5D4] hover:text-white font-medium transition-colors duration-200 relative group inline-block">
                            <span>Inicia sesión</span>
                            <span className="absolute -bottom-0.5 left-1/2 w-0 h-[1px] bg-[#02F5D4] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                        </Link>
                    </p>
                </div>
            </AuthCard>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 md:mt-5 text-center"
            >
                <Link href="/" className="text-xs text-slate-500 hover:text-[#02F5D4] transition-colors duration-300 inline-flex items-center font-sans group">
                    <ArrowLeft className="mr-1.5 group-hover:-translate-x-1 transition-transform" size={14} />
                    Volver a la página principal
                </Link>
            </motion.div>
        </div>
    );
}
