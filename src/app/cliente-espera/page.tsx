"use client"

import { useState, useEffect } from 'react'
import { MessageSquare, User, Clock, AlertCircle, Dumbbell } from 'lucide-react'
import { getSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface ClienteInfo {
    id: number
    nombre: string
    telefono: string
    foto?: string
    rol: string
    entrenadorAsignado?: { id: number; nombre: string; telefono: string } | null
}

const navItems = [
    { id: 'status', label: 'Estado', icon: <Clock size={18} /> },
    { id: 'profile', label: 'Mi Perfil', icon: <User size={18} /> },
]

export default function ClienteEsperaPage() {
    const [clienteInfo, setClienteInfo] = useState<ClienteInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('status')

    useEffect(() => {
        const fetchClienteInfo = async () => {
            try {
                const session = await getSession()
                if (!session || !session.user) {
                    throw new Error('No se encontró una sesión válida')
                }

                const response = await fetch(`/api/cliente-espera/${session.user.id}`)
                if (!response.ok) {
                    throw new Error('Error al obtener la información del cliente')
                }

                const data = await response.json()
                setClienteInfo(data)
            } catch (err) {
                console.error('Error:', err)
                setError(err instanceof Error ? err.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchClienteInfo()
    }, [])

    const handleWhatsAppClick = () => {
        const adminWhatsApp = '+5354710329'
        const message = encodeURIComponent('Hola, estoy interesad@ en unirme al Gimnasio')
        window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, '_blank')
    }

    const handleSignOut = async () => {
        const { signOut } = await import('next-auth/react')
        await signOut({ callbackUrl: '/' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-center"
                >
                    <Dumbbell className="w-12 h-12 text-[#02F5D4] mx-auto mb-4 animate-pulse" />
                    <p className="text-white/50 text-sm font-sans">Cargando...</p>
                </motion.div>
            </div>
        )
    }

    if (error || !clienteInfo) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-3">Error</h1>
                    <p className="text-white/50 font-sans mb-6">{error || 'No se pudo cargar la información'}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200"
                    >
                        Volver al inicio
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <DashboardLayout title="Cliente en Espera" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut}>
            <AnimatePresence mode="wait">
                {activeTab === 'status' && (
                    <motion.div
                        key="status"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl mx-auto"
                    >
                        {/* Welcome Card */}
                        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 overflow-hidden mb-8">
                            <div className="relative p-8 text-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/5 via-transparent to-[#2272FF]/5" />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2272FF]/20 to-[#02F5D4]/20 border-2 border-white/10 mx-auto mb-6 flex items-center justify-center"
                                >
                                    {clienteInfo.foto ? (
                                        <img src={clienteInfo.foto} alt={clienteInfo.nombre} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <User size={32} className="text-white/40" />
                                    )}
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-3"
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#02F5D4] to-[#2272FF]">
                                        Bienvenido, {clienteInfo.nombre}
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-white/50 font-sans text-lg leading-relaxed max-w-md mx-auto"
                                >
                                    Tu registro ha sido exitoso. Estás a un paso de comenzar tu viaje hacia una vida más saludable.
                                </motion.p>
                            </div>
                        </div>

                        {/* Status Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 mb-8"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-heading font-bold text-white mb-1">Estado de tu Solicitud</h3>
                                    <p className="text-white/50 font-sans text-sm leading-relaxed">
                                        Tu solicitud está siendo revisada por el administrador. Te notificaremos cuando seas aprobado.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="rounded-2xl bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 p-6"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-heading font-bold text-white mb-2">¿Tienes prisa?</h3>
                                <p className="text-white/50 font-sans text-sm">
                                    Contacta al administrador directamente por WhatsApp para acelerar tu proceso.
                                </p>
                            </div>

                            <motion.button
                                onClick={handleWhatsAppClick}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 px-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20"
                            >
                                <MessageSquare size={22} />
                                Contactar al Administrador
                            </motion.button>
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-8 text-center"
                        >
                            <p className="text-white/30 text-xs font-sans">
                                ¿Ya tienes una cuenta?{' '}
                                <Link href="/login/inicio" className="text-[#02F5D4] hover:text-white transition-colors">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                )}

                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-lg font-heading font-bold text-white">Mi Perfil</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {clienteInfo.foto ? (
                                            <img src={clienteInfo.foto} alt={clienteInfo.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={28} className="text-white/30" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-heading font-bold text-white">{clienteInfo.nombre}</h4>
                                        <p className="text-white/40 text-sm font-sans">Cliente en Espera</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                                        <span className="text-white/40 text-sm font-sans">Teléfono</span>
                                        <span className="text-white text-sm font-sans">{clienteInfo.telefono}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                                        <span className="text-white/40 text-sm font-sans">Estado</span>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-sans">
                                            <Clock size={12} />
                                            En Espera
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}