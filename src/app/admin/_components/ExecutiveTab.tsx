"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, AlertTriangle, Award, UserCheck, UserMinus, Calendar, UserPlus } from "lucide-react";

const RosenBarChart = dynamic(() => import("@/components/charts/RosenBarChart"), { ssr: false });
const RosenLineChart = dynamic(() => import("@/components/charts/RosenLineChart"), { ssr: false });

interface AnalyticsData {
  totalClients: number;
  activeMemberships: number;
  totalCheckinsThisMonth: number;
  newClientsThisMonth: number;
  totalTrainers: number;
  revenueForecast: { month: string; actual: number; forecast: number | null }[];
  churnRisk: { id: number; nombre: string; membresia: string; expira: string; diasRestantes: number }[];
  avgLTV: number;
  avgCAC: number;
  retentionRate: number;
  trainerMetrics: { id: number; nombre: string; foto: string | null; totalClientes: number; clientesActivos: number; ingresosEstimados: number }[];
}

interface CohortData {
  cohort: string;
  total: number;
  retention: { '1m': number; '3m': number; '6m': number; '12m': number };
}

export default function ExecutiveTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics?type=executive').then(r => r.json()),
      fetch('/api/admin/analytics?type=cohorts').then(r => r.json())
    ])
      .then(([exec, cohortData]) => {
        setData(exec);
        setCohorts(cohortData.cohorts || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-white/30">Cargando analíticas...</div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-400">Error al cargar analíticas</div>;
  }

  const forecastData = data.revenueForecast.map(f => ({
    label: f.month,
    value: f.actual,
    color: "#2272FF"
  }))
  const forecastLines = data.revenueForecast
    .filter(f => f.forecast !== null)
    .map(f => ({ label: f.month, value: f.forecast! }))

  const churnColors = data.churnRisk.map((c, i) => ({
    ...c,
    color: c.diasRestantes <= 2 ? "#EF4444" : c.diasRestantes <= 5 ? "#F59E0B" : "#3B82F6"
  }))

  const barChartData = [
    { label: "Activos", value: data.activeMemberships, color: "#02F5D4" },
    { label: "Nuevos (Mes)", value: data.newClientsThisMonth, color: "#2272FF" },
    { label: "Check-Ins", value: data.totalCheckinsThisMonth, color: "#8B5CF6" },
    { label: "Trainers", value: data.totalTrainers, color: "#F59E0B" },
  ]

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#02F5D4] to-[#2272FF] animate-pulse" />
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em]">Analítica Avanzada</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Executive <span className="text-outline">Dashboard</span>
        </h1>
        <p className="text-white/30 text-lg max-w-2xl">
          Pronósticos, retención, LTV y rendimiento de entrenadores.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: <Users size={18} />, label: "LTV Promedio", value: data.avgLTV.toLocaleString(), sub: "CUP por cliente", color: "cyan" },
          { icon: <TrendingUp size={18} />, label: "Retención", value: `${data.retentionRate}%`, sub: data.retentionRate >= 70 ? "Buena" : "Necesita mejora", subColor: data.retentionRate >= 70 ? "text-green-400" : "text-red-400", color: "blue" },
          { icon: <UserPlus size={18} />, label: "CAC Mensual", value: data.avgCAC, sub: "nuevos clientes/mes", color: "purple" },
          { icon: <Calendar size={18} />, label: "Check-Ins / Mes", value: data.totalCheckinsThisMonth, sub: `${data.totalClients} clientes totales`, color: "none" },
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(2,245,212,0.08)] transition-all duration-500 rounded-xl group">
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${s.color === 'cyan' ? '[#02F5D4]' : s.color === 'blue' ? '[#2272FF]' : s.color === 'purple' ? 'purple-400' : 'white'}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                {s.icon}
              </div>
              <p className="text-white/30 text-xs uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter stat-value">{s.value}</p>
            <p className={`text-xs mt-1 ${s.subColor || 'text-[#02F5D4]/60'}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(2,245,212,0.08)] transition-all duration-500 rounded-xl group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-1 rounded-full bg-[#02F5D4]" />
              <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Pronóstico</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold">Proyección de Ingresos</h3>
          </div>
          <div className="h-[240px] md:h-[280px] overflow-hidden">
            <RosenBarChart data={forecastData} />
          </div>
          {forecastLines.length > 0 && (
            <p className="text-white/30 text-xs mt-3 font-mono">
              Próximo mes estimado: <span className="text-[#02F5D4] font-bold">{forecastLines[0].value.toLocaleString()} CUP</span>
            </p>
          )}
        </div>

        <div className="relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(250,204,21,0.08)] transition-all duration-500 rounded-xl group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-white/30 text-xs uppercase tracking-[0.2em]">Riesgo</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold mt-2">Próximos a Vencer (7 días)</h3>
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {churnColors.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all" style={{ borderLeft: `2px solid ${c.color}` }}>
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">{c.nombre}</p>
                  <span className={`text-xs font-mono font-bold ${c.diasRestantes <= 2 ? 'text-red-400' : c.diasRestantes <= 5 ? 'text-yellow-400' : 'text-white/40'}`}>{c.diasRestantes}d</span>
                </div>
                <p className="text-white/30 text-xs">{c.membresia} · Vence {c.expira}</p>
              </div>
            ))}
            {data.churnRisk.length === 0 && (
              <div className="text-center py-8">
                <Award size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-sm">Sin riesgos próximos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(2,245,212,0.08)] transition-all duration-500 rounded-xl group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#02F5D4]/10 border border-[#02F5D4]/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-[#02F5D4]" />
              </div>
              <p className="text-white/30 text-xs uppercase tracking-[0.2em]">Entrenadores</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold mt-2">Rendimiento</h3>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-4 p-3 border-b border-white/[0.06] text-white/20 text-xs uppercase tracking-wider font-medium">
              <span>Nombre</span>
              <span>Clientes</span>
              <span>Activos</span>
              <span>Ingresos Est.</span>
            </div>
            {data.trainerMetrics.map((t) => (
              <div key={t.id} className="grid grid-cols-4 gap-4 p-3 border-l-2 border-transparent hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all rounded-r-lg">
                <span className="text-white text-sm font-medium">{t.nombre}</span>
                <span className="text-white/60 text-sm">{t.totalClientes}</span>
                <span className="text-white/60 text-sm">{t.clientesActivos}</span>
                <span className="text-[#02F5D4] text-sm font-mono">{t.ingresosEstimados.toLocaleString()}</span>
              </div>
            ))}
            {data.trainerMetrics.length === 0 && (
              <div className="text-center py-8">
                <Users size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-sm">Sin entrenadores registrados</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(168,85,247,0.08)] transition-all duration-500 rounded-xl group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-1 rounded-full bg-purple-400" />
              <p className="text-purple-400 text-xs uppercase tracking-[0.2em]">Cohortes</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold mt-2">Retención por Cohorte</h3>
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {cohorts.map((c) => (
              <div key={c.cohort} className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all border-l-2 border-white/10 hover:border-[#02F5D4]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-medium">{c.cohort}</p>
                  <span className="text-white/30 text-xs">{c.total} clientes</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">1m: {c.retention['1m']}%</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">3m: {c.retention['3m']}%</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">6m: {c.retention['6m']}%</span>
                  {c.retention['12m'] > 0 && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">12m: {c.retention['12m']}%</span>}
                </div>
              </div>
            ))}
            {cohorts.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-sm">Datos insuficientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
