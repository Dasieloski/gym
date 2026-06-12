"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthCard from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function LoginPage() {
    const { register, handleSubmit, setValue } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('username');
        if (saved) setValue('username', saved);
    }, [setValue]);

    const onSubmit = async (data: any) => {
        setError(null);
        setIsLoading(true);

        if (data.rememberMe) {
            localStorage.setItem('username', data.username);
        } else {
            localStorage.removeItem('username');
        }

        try {
            const result = await signIn("credentials", {
                redirect: false,
                username: data.username,
                password: data.password,
            });

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            if (result?.ok) {
                const updatedSession = await getSession();
                if (updatedSession?.user?.rol) {
                    let redirectUrl = '/';
                    switch (updatedSession.user.rol) {
                        case 'ENTRENADOR':
                            redirectUrl = '/entrenador';
                            break;
                        case 'ADMIN':
                            redirectUrl = '/admin';
                            break;
                        case 'CLIENTE':
                            redirectUrl = `/cliente/${updatedSession.user.id}`;
                            break;
                        case 'CLIENTEESPERA':
                            redirectUrl = '/cliente-espera';
                            break;
                    }
                    window.location.href = redirectUrl;
                    return;
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            setError('Ocurrió un error inesperado. Por favor, intente de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-10">
            <div className="-mb-3 md:mb-0">
                <AuthHeader />
            </div>

            <AuthCard className="p-4 md:p-6">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-1 tracking-tight">Iniciar Sesión</h2>
                <p className="text-white/40 text-xs font-sans mb-5">Accede a tu cuenta de Gimnasio</p>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="group/input">
                        <label htmlFor="username" className="block text-xs font-medium font-sans text-white/40 mb-1.5">
                            Username
                        </label>
                        <AuthInput
                            id="username"
                            {...register("username", { required: true })}
                            type="text"
                            placeholder="juan23"
                        />
                    </div>

                    <div className="group/input">
                        <label htmlFor="password" className="block text-xs font-medium font-sans text-white/40 mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <AuthInput
                                id="password"
                                {...register("password", { required: true })}
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
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            {...register("rememberMe")}
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#02F5D4] focus:ring-[#02F5D4] focus:ring-offset-0 transition-colors"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-xs text-white/40 font-sans">
                            Recordarme
                        </label>
                    </div>

                    {error && (
                        <motion.div
                            key={error}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="animate-shake bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                        >
                            <p className="text-red-400 text-xs font-sans">{error}</p>
                        </motion.div>
                    )}

                    <AuthButton
                        type="submit"
                        isLoading={isLoading}
                        icon={<LogIn size={16} />}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </AuthButton>
                </form>

                <div className="mt-5 text-center border-t border-white/5 pt-4">
                    <p className="text-xs text-slate-400 font-sans">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/login/registrarse" className="text-[#02F5D4] hover:text-white font-medium transition-colors duration-200 relative group inline-block">
                            <span>Regístrate</span>
                            <span className="absolute -bottom-0.5 left-1/2 w-0 h-[1px] bg-[#02F5D4] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                        </Link>
                    </p>
                </div>
            </AuthCard>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
            >
                <Link href="/" className="text-xs text-slate-500 hover:text-[#02F5D4] transition-colors duration-300 inline-flex items-center font-sans group">
                    <ArrowLeft className="mr-1.5 group-hover:-translate-x-1 transition-transform" size={14} />
                    Volver a la página principal
                </Link>
            </motion.div>
        </div>
    );
}
