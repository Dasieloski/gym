"use client"
import { useState, useEffect } from 'react'
import { Users, Clock, CreditCard, Dumbbell, Calendar } from 'lucide-react'
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/glass-card';
import RutinasEntrenadorTab from './_components/RutinasEntrenadorTab';
import PagosEntrenadorTab from './_components/PagosEntrenadorTab';

interface Client {
  id: number;
  nombre: string;
  carnetIdentidad: string;
  telefono: string;
  foto: string;
  entrenadorAsignadoId: number | null;
  membresiaActual: { id: number; tipo: string; fechaInicio: string; fechaFin: string; estadoPago: string } | null;
  lastPayment?: string;
  nextPayment?: string;
  daysUntilPayment?: number;
}

interface Schedule {
  id: number;
  clientName: string;
  date: string;
  time: string;
  foto?: string;
}

export default function TrainerPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [searchClients, setSearchClients] = useState('');
  const [searchSchedules, setSearchSchedules] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (session?.user?.id) {
          const response = await fetch(`/api/entrenador/${session.user.id}`);
          if (response.ok) setClients(await response.json());
        }
      } catch (error) { console.error('Error:', error); }
    };
    fetchClients();
  }, [session]);

  const schedules: Schedule[] = clients.flatMap(client =>
    (client as unknown as { reservasCliente?: { id: number; fecha: string; estado: string }[] }).reservasCliente?.filter(r => r.estado === 'ACTIVA').map(reserva => {
      const [date, time] = reserva.fecha.split('T');
      return { id: reserva.id, clientName: client.nombre, date, time: time?.slice(0, 5) || '', foto: client.foto };
    }) || []
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredClients = clients.filter(c =>
    c.nombre.toLowerCase().includes(searchClients.toLowerCase()) ||
    c.telefono.includes(searchClients) ||
    c.membresiaActual?.tipo?.toLowerCase().includes(searchClients.toLowerCase())
  );

  const filteredSchedules = schedules.filter(s =>
    s.clientName.toLowerCase().includes(searchSchedules.toLowerCase()) ||
    s.date.includes(searchSchedules)
  );

  const handleCancelReservation = async (reservationId: number) => {
    try {
      const response = await fetch(`/api/entrenador/${reservationId}`, { method: 'DELETE' });
      if (response.ok) {
        setClients(prev => prev.map(c => ({
          ...c,
          reservasCliente: (c as unknown as { reservasCliente?: { id: number; fecha: string; estado: string }[] }).reservasCliente?.map(r =>
            r.id === reservationId ? { ...r, estado: 'CANCELADA' } : r
          ) || [],
        })));
      }
    } catch (error) { console.error('Error:', error); }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { id: 'clients', label: 'Mis Clientes', icon: <Users size={18} /> },
    { id: 'rutinas', label: 'Rutinas', icon: <Dumbbell size={18} /> },
    { id: 'schedules', label: 'Horarios', icon: <Clock size={18} /> },
    { id: 'payments', label: 'Pagos', icon: <CreditCard size={18} /> },
  ];

  return (
    <DashboardLayout title="Entrenador" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut}>
      {activeTab === 'clients' && (
        <div className="min-h-screen">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#02F5D4] to-[#2272FF] animate-pulse" />
              <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em]">Clientes Asignados</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Mis <span className="text-outline">Clientes</span>
            </h1>
            <p className="text-white/30 text-base max-w-2xl">Gestiona tus clientes asignados, sus membresías y más.</p>
          </motion.div>

          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users size={16} className="text-white/20" />
            </div>
            <input
              type="text" placeholder="Buscar clientes..."
              value={searchClients} onChange={(e) => setSearchClients(e.target.value)}
              className="w-full sm:w-96 bg-white/[0.03] border border-white/[0.08] pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#02F5D4]/40 focus:shadow-[0_0_20px_-8px_rgba(2,245,212,0.15)] placeholder:text-white/20 rounded-xl transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client, index) => (
              <GlassCard key={client.id} delay={index * 0.1} glow="cyan" className="premium-card-hover">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/10 to-transparent" />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/20 to-[#2272FF]/20 rounded-full blur-lg opacity-40" />
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] shrink-0 relative">
                        {client.foto ? (
                          <img src={client.foto} alt={client.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users size={24} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-heading">{client.nombre}</h3>
                      <p className="text-xs text-white/30 font-mono">{client.carnetIdentidad}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-white/40">Teléfono:</span>
                      <span className="text-white/70">{client.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#02F5D4]/40" />
                      <span className="text-white/40">Membresía:</span>
                      <span className="text-[#02F5D4] font-medium">{client.membresiaActual?.tipo || 'Sin membresía'}</span>
                    </div>
                    {client.nextPayment && (
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-white/40">Próximo pago:</span>
                        <span className="text-white/70">{new Date(client.nextPayment).toLocaleDateString()}</span>
                      </div>
                    )}
                    {client.daysUntilPayment !== null && client.daysUntilPayment !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-white/40">Días restantes:</span>
                        <span className={`font-bold font-mono ${client.daysUntilPayment <= 7 ? 'text-red-400' : 'text-emerald-400'}`}>{client.daysUntilPayment}</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://wa.me/${client.telefono}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-5 w-full block text-center py-3 bg-gradient-to-r from-green-500/10 to-green-600/5 hover:from-green-500/20 hover:to-green-600/10 border border-green-500/20 hover:border-green-500/40 text-green-400 hover:text-green-300 text-sm transition-all duration-300 rounded-xl font-medium"
                  >
                    Mensaje por WhatsApp
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
          {filteredClients.length === 0 && (
            <div className="text-center py-16">
              <Users size={40} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/20 text-center">No hay clientes asignados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rutinas' && <RutinasEntrenadorTab />}

      {activeTab === 'schedules' && (
        <div className="min-h-screen">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#02F5D4] to-[#2272FF] animate-pulse" />
              <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em]">Horarios</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Gestión de <span className="text-outline">Horarios</span>
            </h1>
            <p className="text-white/30 text-base max-w-2xl">Visualiza y administra las reservas de tus clientes.</p>
          </motion.div>

          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Clock size={16} className="text-white/20" />
            </div>
            <input
              type="text" placeholder="Buscar horarios..."
              value={searchSchedules} onChange={(e) => setSearchSchedules(e.target.value)}
              className="w-full sm:w-96 bg-white/[0.03] border border-white/[0.08] pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#02F5D4]/40 focus:shadow-[0_0_20px_-8px_rgba(2,245,212,0.15)] placeholder:text-white/20 rounded-xl transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((schedule, index) => (
              <GlassCard key={schedule.id} delay={index * 0.05} glow="cyan" className="premium-card-hover">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/10 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/10 to-[#2272FF]/10 rounded-full blur-md opacity-40" />
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] shrink-0 relative">
                        {schedule.foto ? (
                          <img src={schedule.foto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Users size={16} className="text-white/20" /></div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-white font-heading">{schedule.clientName}</h3>
                  </div>
                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#02F5D4]/40" />
                      <span className="text-white/40">Fecha:</span>
                      <span className="text-white/70">{new Date(schedule.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#02F5D4]/40" />
                      <span className="text-white/40">Hora:</span>
                      <span className="text-[#02F5D4] font-medium">{schedule.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelReservation(schedule.id)}
                    className="w-full py-3 bg-gradient-to-r from-red-500/10 to-red-600/5 hover:from-red-500/20 hover:to-red-600/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-sm transition-all duration-300 rounded-xl font-medium"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
          {filteredSchedules.length === 0 && (
            <div className="text-center py-16">
              <Calendar size={40} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/20 text-center">No hay reservas activas</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && <PagosEntrenadorTab />}

      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8">
            <p className="text-white">Cargando...</p>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
