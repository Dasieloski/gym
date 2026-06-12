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
        <div className="animate-pulse text-slate-500">Cargando analíticas...</div>
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
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Analítica Avanzada</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Executive <span className="text-outline">Dashboard</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Pronósticos, retención, LTV y rendimiento de entrenadores.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-12">
        <div className="border-l border-white/20 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#02F5D4]" />
            <p className="text-white/40 text-xs uppercase tracking-wider">LTV Promedio</p>
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">{data.avgLTV.toLocaleString()}</p>
          <p className="text-[#02F5D4] text-xs mt-1">CUP por cliente</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#02F5D4]" />
            <p className="text-white/40 text-xs uppercase tracking-wider">Retención</p>
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">{data.retentionRate}%</p>
          <p className={`text-xs mt-1 font-mono ${data.retentionRate >= 70 ? 'text-green-400' : 'text-red-400'}`}>
            {data.retentionRate >= 70 ? 'Buena' : 'Necesita mejora'}
          </p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-[#02F5D4]" />
            <p className="text-white/40 text-xs uppercase tracking-wider">CAC Mensual</p>
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">{data.avgCAC}</p>
          <p className="text-slate-500 text-xs mt-1">nuevos clientes/mes</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#02F5D4]" />
            <p className="text-white/40 text-xs uppercase tracking-wider">Check-Ins / Mes</p>
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">{data.totalCheckinsThisMonth}</p>
          <p className="text-slate-500 text-xs mt-1">{data.totalClients} clientes totales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden">
          <div className="mb-6">
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Pronóstico</p>
            <h3 className="text-white text-xl md:text-2xl font-bold">Proyección de Ingresos</h3>
          </div>
          <div className="h-[240px] md:h-[280px] overflow-hidden">
            <RosenBarChart data={forecastData} />
          </div>
          {forecastLines.length > 0 && (
            <p className="text-slate-400 text-xs mt-2">
              Próximo mes estimado: <span className="text-[#02F5D4] font-bold">{forecastLines[0].value.toLocaleString()} CUP</span>
            </p>
          )}
        </div>

        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Riesgo</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold">Próximos a Vencer (7 días)</h3>
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {churnColors.map((c) => (
              <div key={c.id} className="p-3 border-l-2" style={{ borderColor: c.color }}>
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">{c.nombre}</p>
                  <span className="text-xs font-mono" style={{ color: c.color }}>{c.diasRestantes}d</span>
                </div>
                <p className="text-slate-500 text-xs">{c.membresia} · Vence {c.expira}</p>
              </div>
            ))}
            {data.churnRisk.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">Sin riesgos próximos</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#02F5D4]" />
              <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Entrenadores</p>
            </div>
            <h3 className="text-white text-xl md:text-2xl font-bold">Rendimiento</h3>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-4 p-3 border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
              <span>Nombre</span>
              <span>Clientes</span>
              <span>Activos</span>
              <span>Ingresos Est.</span>
            </div>
            {data.trainerMetrics.map((t) => (
              <div key={t.id} className="grid grid-cols-4 gap-4 p-3 border-l-2 border-transparent hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <span className="text-white text-sm font-medium">{t.nombre}</span>
                <span className="text-slate-300 text-sm">{t.totalClientes}</span>
                <span className="text-slate-300 text-sm">{t.clientesActivos}</span>
                <span className="text-[#02F5D4] text-sm font-mono">{t.ingresosEstimados.toLocaleString()}</span>
              </div>
            ))}
            {data.trainerMetrics.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">Sin entrenadores registrados</p>
            )}
          </div>
        </div>

        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden">
          <div className="mb-6">
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Cohortes</p>
            <h3 className="text-white text-xl md:text-2xl font-bold">Retención por Cohorte</h3>
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {cohorts.map((c) => (
              <div key={c.cohort} className="p-3 border-l-2 border-white/10 hover:border-[#02F5D4] transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm font-medium">{c.cohort}</p>
                  <span className="text-slate-400 text-xs">{c.total} clientes</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-400">1m: {c.retention['1m']}%</span>
                  <span className="text-yellow-400">3m: {c.retention['3m']}%</span>
                  <span className="text-red-400">6m: {c.retention['6m']}%</span>
                  {c.retention['12m'] > 0 && <span className="text-purple-400">12m: {c.retention['12m']}%</span>}
                </div>
              </div>
            ))}
            {cohorts.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">Datos insuficientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
