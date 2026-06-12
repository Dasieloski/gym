"use client"
import { useState, useEffect } from 'react'
import { Users, Clock, CreditCard, Dumbbell } from 'lucide-react'
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
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Clientes Asignados</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Mis <span className="text-outline">Clientes</span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">Gestiona tus clientes asignados, sus membresías y más.</p>
          </motion.div>

          <div className="relative mb-8">
            <input
              type="text" placeholder="Buscar clientes..."
              value={searchClients} onChange={(e) => setSearchClients(e.target.value)}
              className="w-full sm:w-96 bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4] placeholder:text-white/30 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client, index) => (
              <GlassCard key={client.id} delay={index * 0.1}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white/[0.03] border border-white/10 shrink-0">
                      {client.foto ? (
                        <img src={client.foto} alt={client.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users size={24} className="text-white/30" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-heading">{client.nombre}</h3>
                      <p className="text-xs text-white/40">{client.carnetIdentidad}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-white/50">
                    <p>Teléfono: {client.telefono}</p>
                    <p>Membresía: <span className="text-[#02F5D4]">{client.membresiaActual?.tipo || 'Sin membresía'}</span></p>
                    {client.nextPayment && (
                      <p>Próximo pago: {new Date(client.nextPayment).toLocaleDateString()}</p>
                    )}
                    {client.daysUntilPayment !== null && client.daysUntilPayment !== undefined && (
                      <p>Días restantes: <span className={client.daysUntilPayment <= 7 ? 'text-red-400' : 'text-white/50'}>{client.daysUntilPayment}</span></p>
                    )}
                  </div>
                  <a
                    href={`https://wa.me/${client.telefono}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-4 w-full block text-center py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-sm transition-all rounded-xl"
                  >
                    Mensaje por WhatsApp
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
          {filteredClients.length === 0 && (
            <p className="text-white/30 text-center py-12">No hay clientes asignados</p>
          )}
        </div>
      )}

      {activeTab === 'rutinas' && <RutinasEntrenadorTab />}

      {activeTab === 'schedules' && (
        <div className="min-h-screen">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Horarios</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Gestión de <span className="text-outline">Horarios</span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">Visualiza y administra las reservas de tus clientes.</p>
          </motion.div>

          <div className="relative mb-8">
            <input
              type="text" placeholder="Buscar horarios..."
              value={searchSchedules} onChange={(e) => setSearchSchedules(e.target.value)}
              className="w-full sm:w-96 bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4] placeholder:text-white/30 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((schedule, index) => (
              <GlassCard key={schedule.id} delay={index * 0.05}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/[0.03] border border-white/10 shrink-0">
                      {schedule.foto ? (
                        <img src={schedule.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Users size={16} className="text-white/30" /></div>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white font-heading">{schedule.clientName}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-white/50 mb-4">
                    <p>Fecha: {new Date(schedule.date).toLocaleDateString()}</p>
                    <p>Hora: {schedule.time}</p>
                  </div>
                  <button
                    onClick={() => handleCancelReservation(schedule.id)}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm transition-all"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
          {filteredSchedules.length === 0 && (
            <p className="text-white/30 text-center py-12">No hay reservas activas</p>
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
