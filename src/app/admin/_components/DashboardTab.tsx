"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Target, Users, DollarSign, CreditCard, Clock, XCircle, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import UsdValue from "@/components/UsdValue";
import dayjs from "@/lib/dayjs";

const RosenBarChart = dynamic(() => import("@/components/charts/RosenBarChart"), { ssr: false });
const RosenPieChart = dynamic(() => import("@/components/charts/RosenPieChart"), { ssr: false });
const RosenLineChart = dynamic(() => import("@/components/charts/RosenLineChart"), { ssr: false });
import { ClientType } from "@/types/client";
import { Booking } from "@/types/booking";

interface Historial {
  accion: string;
  descripcion: string;
  usuario: { nombre: string };
}

interface User {
  id: string;
  rol: string;
  nombre: string;
  foto: string;
}

interface DashboardTabProps {
  totalClientes: number;
  clientesPorcentaje: number;
  ingresosMensuales: number;
  ingresosPorcentaje: number;
  clientesConMembresia: ClientType[];
  membresiasHoy: number;
  userRoles: User[];
  clientesProximosPagos: ClientType[];
  clientesEspera: ClientType[];
  clientes: ClientType[];
  bookings: Booking[];
  historiales: Historial[];
  asistenciaMensual: number[];
  ingresosUltimosMeses: { label: string; value: number }[];
  pieChartData: { label: string; value: number; color: string }[];
  totalMensual: number;
  totalTrimestral: number;
  totalAnual: number;
  calculateDaysUntilPayment: (fechaFin: string) => number;
  incomeStartDate: string;
  setIncomeStartDate: (value: string) => void;
  incomeEndDate: string;
  setIncomeEndDate: (value: string) => void;
  ingresosEnRango: number;
}

const card = "relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(2,245,212,0.08)] transition-all duration-500 rounded-xl group"

export default function DashboardTab({
  totalClientes,
  clientesPorcentaje,
  ingresosMensuales,
  ingresosPorcentaje,
  clientesConMembresia,
  membresiasHoy,
  userRoles,
  clientesProximosPagos,
  clientesEspera,
  clientes,
  bookings,
  historiales,
  asistenciaMensual,
  pieChartData,
  totalMensual,
  totalTrimestral,
  totalAnual,
  calculateDaysUntilPayment,
  incomeStartDate,
  setIncomeStartDate,
  incomeEndDate,
  setIncomeEndDate,
  ingresosEnRango,
  ingresosUltimosMeses,
}: DashboardTabProps) {
  const [metasDashboard, setMetasDashboard] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/metas")
      .then((r) => r.ok && r.json())
      .then((d) => setMetasDashboard(d?.metas?.filter((m: any) => m.activa) || []))
      .catch(() => {});
  }, []);

  const vencidas = clientesConMembresia.filter(
    (c: ClientType) =>
      c.membresiaActual && calculateDaysUntilPayment(c.membresiaActual.fechaFin) < 0
  ).length;

  const reservasHoy = bookings.filter((b: Booking) => dayjs(b.fecha).isSame(dayjs(), "day")).length;

  const membresiaPopular =
    totalMensual >= totalTrimestral && totalMensual >= totalAnual
      ? "Mensual"
      : totalTrimestral >= totalAnual
      ? "Trimestral"
      : "Anual";

  const tasaConversion =
    clientesEspera.length + clientes.length > 0
      ? `${Math.round((clientes.length / (clientes.length + clientesEspera.length)) * 100)}%`
      : "0%";

  const alertasPendientes = clientesProximosPagos.length + vencidas;

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#02F5D4] to-[#2272FF] animate-pulse" />
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em]">Dashboard</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Panel de <span className="text-outline">Control</span>
        </h1>
        <p className="text-white/30 text-lg max-w-2xl">
          Métricas en tiempo real del gimnasio.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatBlock label="Clientes" value={totalClientes} trend={clientesPorcentaje} icon={<Users size={18} className="text-[#02F5D4]" />} />
        <StatBlock label="Ingresos" value={`${ingresosMensuales.toLocaleString()}`} unit="CUP" trend={ingresosPorcentaje} rawAmount={ingresosMensuales} icon={<DollarSign size={18} className="text-emerald-400" />} />
        <StatBlock label="Membresías" value={clientesConMembresia.length} sub={`${membresiasHoy} nuevas hoy`} icon={<CreditCard size={18} className="text-[#2272FF]" />} />
        <StatBlock label="Entrenadores" value={userRoles.filter((u: User) => u.rol === "ENTRENADOR").length} icon={<Users size={18} className="text-purple-400" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <AlertBlock label="Próximos a Vencer" count={clientesProximosPagos.length} color="text-yellow-400" icon={<Clock size={16} />} />
        <AlertBlock label="Vencidas" count={vencidas} color="text-red-400" icon={<XCircle size={16} />} />
        <AlertBlock label="En Espera" count={clientesEspera.length} color="text-cyan-400" icon={<Users size={16} />} />
        <AlertBlock label="Reservas Hoy" count={reservasHoy} color="text-green-400" icon={<Calendar size={16} />} />
      </div>

      <div className={`${card} mb-12`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-1 rounded-full bg-[#02F5D4]" />
              <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Ingresos por Período</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold mb-6">Calcular Ingresos entre Fechas</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-white/30 text-xs uppercase tracking-[0.2em] mb-2 block">Desde</label>
                <input
                  type="date"
                  value={incomeStartDate}
                  onChange={(e) => setIncomeStartDate(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 focus:shadow-[0_0_20px_-8px_rgba(2,245,212,0.15)] px-4 py-2.5 text-white text-sm focus:outline-none transition-all rounded-xl"
                />
              </div>
              <div>
                <label className="text-white/30 text-xs uppercase tracking-[0.2em] mb-2 block">Hasta</label>
                <input
                  type="date"
                  value={incomeEndDate}
                  onChange={(e) => setIncomeEndDate(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 focus:shadow-[0_0_20px_-8px_rgba(2,245,212,0.15)] px-4 py-2.5 text-white text-sm focus:outline-none transition-all rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-2">Ingresos en el Período</p>
            <p className="text-4xl md:text-5xl font-black text-[#02F5D4] tracking-tighter">
              {ingresosEnRango.toLocaleString()}
            </p>
            <p className="text-white/30 text-sm">CUP</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className={`lg:col-span-2 ${card} overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
          <div className="mb-6 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#02F5D4]" />
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Asistencia</p>
          </div>
          <h3 className="text-white text-xl md:text-2xl font-bold mb-4">Clientes únicos por mes</h3>
          <div className="h-[240px] md:h-[280px] overflow-hidden">
            <RosenBarChart
              data={asistenciaMensual.map((v: number, i: number) => ({
                label: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
                value: v,
                color: i === new Date().getMonth() ? "#02F5D4" : "#2272FF",
              }))}
            />
          </div>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2272FF]/20 to-transparent" />
          <div className="mb-6 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#2272FF]" />
            <p className="text-[#2272FF] text-xs uppercase tracking-[0.2em]">Distribución</p>
          </div>
          <h3 className="text-white text-xl md:text-2xl font-bold mb-4">Tipos de membresía</h3>
          <div className="h-[240px] md:h-[280px] flex items-center justify-center overflow-hidden">
            {totalMensual || totalTrimestral || totalAnual ? (
              <RosenPieChart data={pieChartData} />
            ) : (
              <div className="text-center">
                <CreditCard size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No hay datos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className={`lg:col-span-2 ${card} overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-1 rounded-full bg-[#02F5D4]" />
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Tendencia</p>
                </div>
                <h3 className="text-white text-xl md:text-2xl font-bold">Ingresos últimos 6 meses</h3>
              </div>
              {ingresosUltimosMeses.length >= 2 && ingresosUltimosMeses[ingresosUltimosMeses.length-1].value > ingresosUltimosMeses[0].value && (
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-green-400 text-sm font-mono">+{Math.round((ingresosUltimosMeses[ingresosUltimosMeses.length-1].value - ingresosUltimosMeses[0].value) / (ingresosUltimosMeses[0].value || 1) * 100)}%</span>
                </div>
              )}
            </div>
          <div className="h-[200px] md:h-[240px] overflow-hidden">
            <RosenLineChart
              data={ingresosUltimosMeses.length > 0 ? ingresosUltimosMeses : [
                { label: "-", value: 0 },
              ]}
              color="#02F5D4"
            />
          </div>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mb-6 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <p className="text-white/40 text-xs uppercase tracking-[0.2em]">Actividad</p>
          </div>
          <h3 className="text-white text-xl md:text-2xl font-bold mb-4">Reciente</h3>
          <div className="space-y-1 max-h-[240px] overflow-y-auto">
            {historiales.slice(0, 5).map((item: Historial, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 border-l-2 border-white/[0.06] hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all rounded-r-lg"
              >
                <p className="text-white text-sm font-medium">{item.accion}</p>
                <p className="text-white/40 text-xs mt-1">{item.descripcion}</p>
                <p className="text-white/20 text-xs mt-1">{item.usuario.nombre}</p>
              </motion.div>
            ))}
            {historiales.length === 0 && (
              <div className="text-center py-8">
                <Clock size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {metasDashboard.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#02F5D4]/20 to-[#2272FF]/10 border border-[#02F5D4]/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#02F5D4]" />
            </div>
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Metas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metasDashboard.slice(0, 3).map((m) => (
              <div key={m.id} className="border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 hover:border-white/[0.12] transition-all duration-300 rounded-xl group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-bold truncate mr-2">{m.nombre}</p>
                  <span className={`text-sm font-black font-mono shrink-0 ${m.progreso >= 100 ? 'text-emerald-400' : 'text-white/40'}`}>
                    {m.progreso}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className={`h-full transition-all duration-1000 rounded-full ${m.progreso >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : m.progreso >= 50 ? 'bg-gradient-to-r from-[#02F5D4] to-[#2272FF]' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                    style={{ width: `${m.progreso}%` }} />
                </div>
                <p className="text-white/20 text-xs font-mono">
                  {m.actual.toLocaleString()} / {m.valorMeta.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={card}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <CreditCard size={14} className="text-white/40" />
            </div>
            <p className="text-white/30 text-xs uppercase tracking-[0.2em]">Membresía Popular</p>
          </div>
          <p className="text-3xl font-black text-white">{membresiaPopular}</p>
        </div>
        <div className={card}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <TrendingUp size={14} className="text-[#02F5D4]/60" />
            </div>
            <p className="text-white/30 text-xs uppercase tracking-[0.2em]">Tasa de Conversión</p>
          </div>
          <p className="text-3xl font-black text-[#02F5D4]">{tasaConversion}</p>
        </div>
        <div className={card}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <AlertTriangle size={14} className="text-white/40" />
            </div>
            <p className="text-white/30 text-xs uppercase tracking-[0.2em]">Alertas Pendientes</p>
          </div>
          <p className="text-3xl font-black text-white">{alertasPendientes}</p>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, unit, trend, sub, rawAmount, icon }: { label: string; value: string | number; unit?: string; trend?: number; sub?: string; rawAmount?: number; icon?: React.ReactNode }) {
  return (
    <div className={card}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          {icon}
        </div>
        <p className="text-white/30 text-xs uppercase tracking-[0.2em]">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        {rawAmount !== undefined ? (
          <UsdValue amount={rawAmount} className="text-4xl md:text-5xl font-black text-white tracking-tighter" />
        ) : (
          <p className="text-4xl md:text-5xl font-black stat-value tracking-tighter">{value}</p>
        )}
        {unit && <p className="text-[#02F5D4] text-sm font-medium">{unit}</p>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp size={12} className={trend >= 0 ? 'text-green-400' : 'text-red-400'} />
          <p className={`text-xs font-mono ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </p>
        </div>
      )}
      {sub && <p className="text-white/20 text-xs mt-2">{sub}</p>}
    </div>
  );
}

function AlertBlock({ label, count, color, icon }: { label: string; count: number; color: string; icon?: React.ReactNode }) {
  return (
    <div className={card}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <p className="text-white/30 text-xs uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className={`text-3xl font-black ${color}`}>{count}</p>
    </div>
  );
}
