"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, MessageSquare, User, CreditCard, Calendar, Camera, Plus, Clock, Dumbbell, Flame, LogIn, LogOut, DollarSign, QrCode, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard from '@/components/ui/glass-card';
import WeightTrackingComponent from '@/components/WeightTrackingComponent';
import { toast } from 'react-toastify';
import RutinasView from '@/components/RutinasView';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => ({ default: m.QRCodeSVG })), { ssr: false });

interface RegistroPeso {
    id: string;
    fecha: string;
    peso: number;
    altura: number;
    gluteo: number;
    imc: number;
    grasaCorporal: number;
    cuello: number;
    pecho: number;
    brazo: number;
    cintura: number;
    cadera: number;
    muslo: number;
}
interface ClientInfo {
    id: number;
    foto: string;
    nombre: string;
    carnetIdentidad: string;
    telefono: string;
    rol: string;
    sexo?: string;
    email?: string;
    instagram?: string;
    entrenadorAsignado?: { id: number; nombre: string; telefono: string } | null;
    membresia: { id: number; tipo: string; fechaInicio: string; fechaFin: string; estadoPago: string } | null;
    membresias: { id: number; tipo: string; fechaInicio: string; fechaFin: string; estadoPago: string }[];
    visitasEsteMes: number;
    entrenador: { id: number; nombre: string } | null;
    registrosPeso: RegistroPeso[];
    checkIns?: { id: number; fecha: string; tipo: string; metodo: string }[];
    pagos?: { id: number; monto: number; moneda: string; metodoPago: string; fechaPago: string; referencia?: string }[];
}

interface Booking {
    id: number;
    fecha: string;
    estado: string;
    cliente: { id: number; nombre: string };
    entrenadorNombre?: string;
}

interface PageParams { id: string; }

const MOTIVATIONAL_QUOTES = [
    "El único mal entrenamiento es el que no hiciste.",
    "No dejes que tus excusas sean más fuertes que tus sueños.",
    "El dolor que sientes hoy será tu fuerza mañana.",
    "Tu cuerpo puede soportar casi cualquier cosa. Es tu mente la que debes convencer.",
    "Sé más fuerte que tus excusas.",
    "El éxito comienza cuando sales de tu zona de confort.",
    "No te detengas cuando estés cansado. Detente cuando hayas terminado.",
    "La disciplina es elegir entre lo que quieres ahora y lo que quieres más.",
    "Entrena como si nunca hubieras ganado. Actúa como si nunca hubieras perdido.",
    "El gimnasio es mi terapia.",
    "Cada repetición te acerca a tu meta.",
    "No hay atajos para ningún lugar que valga la pena.",
    "El único límite eres tú.",
    "Tu cuerpo logra lo que tu mente cree.",
    "La motivación te pone en marcha, el hábito te mantiene en movimiento."
]

export default function ClientPage({ params }: { params: PageParams }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('inicio')
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [visitsThisMonth, setVisitsThisMonth] = useState(0)
    const [motivationalQuote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
    const [animatingId, setAnimatingId] = useState<number | null>(null);
    const [newBookingId, setNewBookingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const response = await fetch(`/api/cliente/${params.id}`)
                if (!response.ok) throw new Error('Error al obtener datos')
                const data = await response.json()
                setClientInfo(data)
                setVisitsThisMonth(data.visitasEsteMes || 0)
                if (data.reservas) setBookings(data.reservas);
            } catch (error) { console.error('Error:', error) }
        }
        fetchClientInfo()
    }, [params.id])

    const handleTabChange = (tab: string) => setActiveTab(tab)

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const renderCalendar = () => {
        const days = daysInMonth(currentMonth)
        const firstDay = firstDayOfMonth(currentMonth)
        const calendar = []
        const today = new Date(); today.setHours(0,0,0,0)
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1)

        for (let i = 0; i < firstDay; i++) calendar.push(<div key={`empty-${i}`} className="p-2"></div>)
        for (let i = 1; i <= days; i++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
            const dateString = date.toISOString().split('T')[0]
            const isSelected = selectedDate === dateString
            const isBooked = bookings.some(b => b.fecha.startsWith(dateString))
            const isPast = date < tomorrow
            calendar.push(
                <button key={i} onClick={() => !isPast && setSelectedDate(dateString)}
                    className={`p-2 m-0.5 rounded-lg transition-all duration-200 text-sm font-sans
                    ${isSelected ? 'bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white shadow-lg shadow-[#02F5D4]/30' : ''}
                    ${isBooked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                    ${!isSelected && !isBooked && !isPast ? 'hover:bg-white/10 text-white/70' : ''}
                    ${isPast ? 'text-white/20 cursor-not-allowed' : ''}`}
                    disabled={isBooked || isPast}>{i}</button>
            )
        }
        return calendar
    }

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))

    const bookSession = async (fecha: string, hora: string) => {
        if (!selectedDate || !clientInfo) return
        try {
            const [hour, period] = hora.split(' ')
            let [hours, minutes] = hour.split(':').map(Number)
            if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
            else if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
            const dateTimeString = `${fecha}T${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:00Z`
            const dateTime = new Date(dateTimeString)
            if (isNaN(dateTime.getTime())) throw new Error('Fecha inválida')
            const response = await fetch(`/api/cliente/${clientInfo.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clienteId: clientInfo.id, fecha: dateTime.toISOString() }),
            })
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || 'Error') }
            const newBooking = await response.json()
            setBookings(prev => [...prev, newBooking.reserva])
            toast.success('Reserva creada exitosamente')
        } catch (error) { toast.error('Error al crear la reserva') }
    }

    const cancelBooking = async (id: number) => {
        setAnimatingId(id)
        setTimeout(async () => {
            try {
                const response = await fetch(`/api/cliente/${id}`, { method: 'DELETE' })
                if (!response.ok) throw new Error('Error al cancelar')
                setBookings(prev => prev.filter(b => b.id !== id))
                toast.success('Reserva cancelada')
            } catch (error) { toast.error('Error al cancelar la reserva') }
            finally { setAnimatingId(null) }
        }, 300)
    }

    const formatAMPM = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const formattedHour = hour % 12 || 12
        return `${formattedHour}:00 ${ampm}`
    }

    const handleSignOut = async () => {
        Object.keys(Cookies.get()).forEach(cookieName => Cookies.remove(cookieName))
        if (typeof window !== 'undefined') localStorage.removeItem('token')
        await signOut({ callbackUrl: '/' })
    }

    const formatDate = (dateTimeString: string) => {
        const [date, time] = dateTimeString.split('T')
        return { date, time: time.split('.')[0] }
    }

    const formatDateSimple = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }

    const diasRestantesMembresia = clientInfo?.membresia
        ? Math.ceil((new Date(clientInfo.membresia.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const navItems = [
        { id: 'inicio', label: 'Inicio', icon: <Dumbbell size={18} /> },
        { id: 'membresia', label: 'Membresía', icon: <CreditCard size={18} /> },
        { id: 'pagos', label: 'Pagos', icon: <DollarSign size={18} /> },
        { id: 'reservas', label: 'Reservas', icon: <Calendar size={18} /> },
        { id: 'peso', label: 'Mi Peso', icon: <User size={18} /> },
        { id: 'rutinas', label: 'Rutinas', icon: <ClipboardList size={18} /> },
    ]

    return (
        <DashboardLayout title="Mi Cuenta" navItems={navItems} activeTab={activeTab} onTabChange={handleTabChange} onSignOut={handleSignOut}>
            <AnimatePresence mode="wait">
                {activeTab === 'inicio' && clientInfo && (
                    <motion.div
                        key="inicio"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Welcome Header */}
                        <GlassCard>
                            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#02F5D4]/30 shrink-0">
                                    {clientInfo.foto ? (
                                        <Image src={clientInfo.foto} alt="foto" width={96} height={96} className="object-cover w-full h-full" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            <User size={40} className="text-white/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-heading font-black text-white mb-1">
                                        ¡Hola, {clientInfo.nombre.split(' ')[0]}!
                                    </h2>
                                    <p className="text-white/50 text-sm mb-3">{motivationalQuote}</p>
                                    {clientInfo.membresia && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#02F5D4]/10 border border-[#02F5D4]/20 rounded-full">
                                            <span className={`w-2 h-2 rounded-full ${diasRestantesMembresia !== null && diasRestantesMembresia >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            <span className="text-[#02F5D4] text-sm font-medium">
                                                {clientInfo.membresia.tipo} · {diasRestantesMembresia !== null && diasRestantesMembresia >= 0 ? `${diasRestantesMembresia} días restantes` : 'Vencida'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <GlassCard>
                                <div className="p-4 text-center">
                                    <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                    <p className="text-3xl font-heading font-bold text-white">{visitsThisMonth}</p>
                                    <p className="text-white/40 text-xs">Visitas este mes</p>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="p-4 text-center">
                                    <Calendar className="w-6 h-6 text-[#02F5D4] mx-auto mb-2" />
                                    <p className="text-3xl font-heading font-bold text-white">{bookings.length}</p>
                                    <p className="text-white/40 text-xs">Reservas activas</p>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="p-4 text-center">
                                    <CreditCard className="w-6 h-6 text-[#2272FF] mx-auto mb-2" />
                                    <p className="text-lg font-heading font-bold text-white">{clientInfo.membresia?.tipo || 'Sin'}</p>
                                    <p className="text-white/40 text-xs">Membresía</p>
                                </div>
                            </GlassCard>
                            {clientInfo.entrenadorAsignado && (
                                <GlassCard>
                                    <div className="p-4 text-center">
                                        <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-white truncate">{clientInfo.entrenadorAsignado.nombre}</p>
                                        <p className="text-white/40 text-xs">Entrenador</p>
                                    </div>
                                </GlassCard>
                            )}
                        </div>

                        {/* Trainer Contact */}
                        {clientInfo.entrenadorAsignado && (
                            <GlassCard>
                                <div className="p-6">
                                    <h3 className="text-lg font-heading font-bold text-white mb-4">Tu Entrenador</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                                                <User className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{clientInfo.entrenadorAsignado.nombre}</p>
                                                <p className="text-white/50 text-sm">{clientInfo.entrenadorAsignado.telefono}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://wa.me/${clientInfo.entrenadorAsignado.telefono}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                        >
                                            <MessageSquare size={20} />
                                        </a>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* Recent Check-Ins */}
                        {clientInfo.checkIns && clientInfo.checkIns.length > 0 && (
                            <GlassCard>
                                <div className="p-6">
                                    <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock size={18} className="text-[#02F5D4]" /> Check-Ins Recientes
                                    </h3>
                                    <div className="space-y-2">
                                        {clientInfo.checkIns.slice(0, 5).map(c => (
                                            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                                <div className="flex items-center gap-2">
                                                    {c.tipo === 'ENTRADA' ? <LogIn size={16} className="text-emerald-400" /> : <LogOut size={16} className="text-red-400" />}
                                                    <span className="text-white/70 text-sm">
                                                        {new Date(c.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                        {' '}
                                                        {new Date(c.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${c.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {c.tipo}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        )}
                    </motion.div>
                )}

                {activeTab === 'membresia' && clientInfo && (
                    <motion.div
                        key="membresia"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {clientInfo.membresia && (
                            <GlassCard>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-heading font-bold text-white">Membresía Actual</h3>
                                        <span className={`px-3 py-1 text-xs rounded-full ${clientInfo.membresia.estadoPago === 'PAGADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                            {clientInfo.membresia.estadoPago}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">Tipo</p>
                                            <p className="text-2xl font-bold text-[#02F5D4]">{clientInfo.membresia.tipo}</p>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">Inicio</p>
                                            <p className="text-xl font-bold text-white">{formatDateSimple(clientInfo.membresia.fechaInicio)}</p>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] rounded-xl">
                                            <p className="text-white/40 text-xs mb-1">Vence</p>
                                            <p className="text-xl font-bold text-white">{formatDateSimple(clientInfo.membresia.fechaFin)}</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* QR Code */}
                        <GlassCard>
                            <div className="p-6 text-center">
                                <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center justify-center gap-2">
                                    <QrCode size={18} className="text-[#02F5D4]" /> Tu Código QR
                                </h3>
                                <p className="text-white/40 text-sm mb-4">Presenta este código al llegar al gimnasio para registrar tu entrada</p>
                                <div className="inline-block p-4 bg-white rounded-2xl">
                                    <QRCodeSVG value={`GYM:${clientInfo.id}`} size={180} level="H" />
                                </div>
                                <p className="text-white/30 text-xs mt-4">ID: {clientInfo.id}</p>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-xl font-heading font-bold text-white mb-6">Historial de Membresías</h3>
                                {clientInfo.membresias.length > 0 ? (
                                    <div className="space-y-3">
                                        {clientInfo.membresias.map((m) => (
                                            <div key={m.id} className={`p-4 rounded-xl border ${clientInfo.membresia?.id === m.id ? 'border-[#02F5D4]/30 bg-[#02F5D4]/5' : 'border-white/10 bg-white/[0.02]'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-white font-bold">{m.tipo}</p>
                                                        <p className="text-white/50 text-sm">{formatDateSimple(m.fechaInicio)} - {formatDateSimple(m.fechaFin)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-1 text-xs rounded-md ${m.estadoPago === 'PAGADO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                            {m.estadoPago}
                                                        </span>
                                                        {clientInfo.membresia?.id === m.id && (
                                                            <span className="ml-2 px-2 py-1 text-xs rounded-md bg-[#02F5D4]/10 text-[#02F5D4]">Actual</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/40 text-center py-8">No hay historial de membresías</p>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'pagos' && clientInfo && (
                    <motion.div
                        key="pagos"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-xl font-heading font-bold text-white mb-6">Historial de Pagos</h3>
                                {clientInfo.pagos && clientInfo.pagos.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="pb-3 text-white/50 text-sm font-medium pr-4">Fecha</th>
                                                    <th className="pb-3 text-white/50 text-sm font-medium pr-4">Monto</th>
                                                    <th className="pb-3 text-white/50 text-sm font-medium pr-4">Moneda</th>
                                                    <th className="pb-3 text-white/50 text-sm font-medium pr-4">Método</th>
                                                    <th className="pb-3 text-white/50 text-sm font-medium">Referencia</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clientInfo.pagos.map(p => (
                                                    <tr key={p.id} className="border-b border-white/5">
                                                        <td className="py-3 text-white text-sm pr-4">{new Date(p.fechaPago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td className="py-3 text-white font-bold text-sm pr-4">${p.monto.toFixed(2)}</td>
                                                        <td className="py-3 text-sm pr-4">
                                                            <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/80">{p.moneda}</span>
                                                        </td>
                                                        <td className="py-3 text-white/70 text-sm pr-4">{p.metodoPago}</td>
                                                        <td className="py-3 text-white/50 text-sm">{p.referencia || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-white/40 text-center py-8">No hay pagos registrados</p>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'reservas' && (
                    <motion.div
                        key="reservas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-xl font-heading font-bold text-white mb-6">Reservar Sesión</h3>
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={prevMonth} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <h4 className="text-lg font-semibold text-white capitalize">{currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h4>
                                    <button onClick={nextMonth} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(day => (
                                        <div key={day} className="text-xs font-medium text-white/40 py-2">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {renderCalendar()}
                                </div>
                            </div>
                            {selectedDate && (
                                <div className="px-6 pb-6">
                                    <h4 className="text-sm font-semibold text-white mb-3">Horarios disponibles para {selectedDate}</h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {Array.from({ length: 17 }, (_, i) => i + 5).map(hour => (
                                            <button key={hour} onClick={() => bookSession(selectedDate, formatAMPM(hour))}
                                                className="px-2 py-2 text-xs rounded-lg bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white font-medium hover:shadow-lg hover:shadow-[#02F5D4]/30 transition-all">
                                                {formatAMPM(hour)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard>
                            <div className="p-6">
                                <h3 className="text-xl font-heading font-bold text-white mb-6">Mis Reservas</h3>
                                {bookings.length > 0 ? (
                                    <div className="space-y-3">
                                        {bookings.map(({ id, fecha, estado }) => {
                                            const { date, time } = formatDate(fecha)
                                            return (
                                                <motion.div key={id}
                                                    initial={{ opacity: newBookingId === id ? 0 : 1, y: newBookingId === id ? 10 : 0 }}
                                                    animate={{ opacity: animatingId === id ? 0 : 1, y: animatingId === id ? -10 : 0 }}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="w-5 h-5 text-[#02F5D4]" />
                                                        <div>
                                                            <p className="text-white font-medium">{date}</p>
                                                            <p className="text-white/50 text-sm">{time}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 text-xs rounded-md ${estado === 'ACTIVA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {estado}
                                                        </span>
                                                        {estado === 'ACTIVA' && (
                                                            <button onClick={() => cancelBooking(id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-white/40 text-center py-8">No tienes reservas programadas</p>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'peso' && clientInfo && (
                    <motion.div
                        key="peso"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <WeightTrackingComponent clientId={clientInfo.id.toString()} />
                    </motion.div>
                )}

                {activeTab === 'rutinas' && (
                    <motion.div
                        key="rutinas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <RutinasView />
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}