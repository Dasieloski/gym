"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import { Camera, User, Eye, EyeOff, X, Upload } from "lucide-react";

export default function CreateClientTab() {
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        username: "",
        carnetIdentidad: "",
        telefono: "",
        password: "",
        sexo: "",
        email: "",
        instagram: "",
        comoConocio: "",
        rol: "CLIENTEESPERA"
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) {
                toast.error("La foto debe ser menor de 1 megabyte.");
                return;
            }
            const extension = file.name.split('.').pop()?.toLowerCase();
            const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif'];
            if (!extension || !extensionesPermitidas.includes(extension)) {
                toast.error("El archivo debe ser una imagen con extensión jpg, jpeg, png o gif.");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Debe subir una foto de perfil");
            return;
        }
        if (!formData.sexo) {
            toast.error("El sexo es obligatorio");
            return;
        }

        setIsLoading(true);
        try {
            const formDataFile = new FormData();
            formDataFile.append('file', selectedFile);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formDataFile,
            });
            if (!uploadRes.ok) {
                const errData = await uploadRes.json().catch(() => ({}));
                throw new Error(errData.error || 'Error al subir la imagen');
            }
            const { url: imageUrl } = await uploadRes.json();

            const userData = { ...formData, foto: imageUrl };
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "Cliente creado con éxito");
                setFormData({
                    nombre: "", username: "", carnetIdentidad: "", telefono: "", password: "", sexo: "", email: "", instagram: "", comoConocio: "", rol: "CLIENTEESPERA"
                });
                setPreviewImage(null);
                setSelectedFile(null);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || "Error al crear cliente");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear cliente");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2.5 text-white focus:outline-none transition-colors";

    return (
        <div className="min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
            >
                <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Crear Cliente</p>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                    Nuevo <span className="text-outline">Cliente</span>
                </h1>
                <p className="text-slate-400 text-base max-w-2xl">
                    Crea un cliente directamente sin necesidad de registro público.
                </p>
            </motion.div>

            <div className="border border-white/10 p-6 md:p-8 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center mb-6">
                        <label className="text-slate-500 text-xs uppercase tracking-wider mb-3">Foto de perfil</label>
                        <div className="relative group/photo">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/[0.03] border-2 border-white/10 hover:border-[#02F5D4] transition-all duration-300 cursor-pointer">
                                {previewImage ? (
                                    <Image src={previewImage} alt="Preview" fill className="object-cover" sizes="96px" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Camera className="text-slate-400 group-hover/photo:text-[#02F5D4] transition-colors" size={32} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            {!selectedFile && <p className="text-red-400/80 text-[10px] mt-2 text-center">Foto requerida</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Nombre completo</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Juan Pérez"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="juan23"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Carnet de identidad</label>
                            <input
                                type="text"
                                value={formData.carnetIdentidad}
                                onChange={(e) => setFormData({ ...formData, carnetIdentidad: e.target.value })}
                                placeholder="98765432100"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Teléfono</label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                placeholder="+53 54321000"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Sexo</label>
                            <select
                                value={formData.sexo}
                                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                required
                                className={inputClass}
                            >
                                <option value="" className="bg-[#050505]">Seleccionar</option>
                                <option value="MASCULINO" className="bg-[#050505]">Masculino</option>
                                <option value="FEMENINO" className="bg-[#050505]">Femenino</option>
                                <option value="OTRO" className="bg-[#050505]">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Rol</label>
                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                className={inputClass}
                            >
                                <option value="CLIENTEESPERA" className="bg-[#050505]">Cliente en Espera</option>
                                <option value="CLIENTE" className="bg-[#050505]">Cliente</option>
                                <option value="ENTRENADOR" className="bg-[#050505]">Entrenador</option>
                                <option value="ADMIN" className="bg-[#050505]">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className={inputClass + " pr-10"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#02F5D4] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Correo (opcional)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="juan@email.com"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Instagram (opcional)</label>
                            <input
                                type="text"
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                placeholder="@usuario"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">¿Cómo nos conoció?</label>
                            <select
                                value={formData.comoConocio}
                                onChange={(e) => setFormData({ ...formData, comoConocio: e.target.value })}
                                className={inputClass}
                            >
                                <option value="" className="bg-[#050505]">Seleccionar</option>
                                <option value="REFERIDO" className="bg-[#050505]">Referido por otro cliente</option>
                                <option value="REDES_SOCIALES" className="bg-[#050505]">Redes Sociales</option>
                                <option value="PASO_PUERTA" className="bg-[#050505]">Pasó por la puerta</option>
                                <option value="OTRO" className="bg-[#050505]">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <User size={18} />
                                    Crear Cliente
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}