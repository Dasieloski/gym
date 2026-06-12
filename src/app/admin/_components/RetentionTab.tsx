"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Flame, Star, Gift, Trophy, Zap, ThumbsUp, MessageCircle, Calendar } from "lucide-react";

interface PuntoLeaderboard {
  rank: number;
  usuarioId: number;
  nombre: string;
  foto: string | null;
  totalPuntos: number;
}

interface RachaLeader {
  rank: number;
  usuarioId: number;
  nombre: string;
  foto: string | null;
  rachaActual: number;
  rachaMaxima: number;
  ultimoCheckIn: string | null;
}

interface NPSData {
  total: number;
  promedio: number;
  nps: number;
  promoters: number;
  detractors: number;
  passives: number;
  encuestas: any[];
}

interface Cumpleanio {
  id: number;
  nombre: string;
  foto: string | null;
  fechaNacimiento: string;
  diasRestantes: number;
  recompensaCanjeada: boolean;
}

interface Desafio {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  meta: number;
  diasDuracion: number;
  recompensa: number;
  activo: boolean;
  _count: { participantes: number };
}

export default function RetentionTab() {
  const [activeSection, setActiveSection] = useState("puntos");
  const [puntosLeaderboard, setPuntosLeaderboard] = useState<PuntoLeaderboard[]>([]);
  const [rachasLeaderboard, setRachasLeaderboard] = useState<RachaLeader[]>([]);
  const [npsData, setNpsData] = useState<NPSData | null>(null);
  const [cumpleanios, setCumpleanios] = useState<Cumpleanio[]>([]);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChallenge, setNewChallenge] = useState({ nombre: '', descripcion: '', meta: 10, diasDuracion: 30, recompensa: 100 });

  const fetchData = async (section: string) => {
    setLoading(true);
    try {
      if (section === "puntos" || section === "rachas") {
        const [puntosRes, rachasRes] = await Promise.all([
          fetch('/api/retention/puntos?type=leaderboard&limit=20').then(r => r.json()),
          fetch('/api/retention/rachas').then(r => r.json())
        ])
        setPuntosLeaderboard(puntosRes.leaderboard || [])
        setRachasLeaderboard(rachasRes.leaderboard || [])
      }
      if (section === "nps") {
        const res = await fetch('/api/retention/nps').then(r => r.json())
        setNpsData(res)
      }
      if (section === "cumpleanios") {
        const res = await fetch('/api/retention/cumpleanios').then(r => r.json())
        setCumpleanios(res.cumpleanios || [])
      }
      if (section === "desafios") {
        const res = await fetch('/api/retention/desafios').then(r => r.json())
        setDesafios(res.desafios || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(activeSection)
  }, [activeSection])

  const handleCreateChallenge = async () => {
    try {
      const res = await fetch('/api/retention/desafios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChallenge)
      })
      if (res.ok) {
        setNewChallenge({ nombre: '', descripcion: '', meta: 10, diasDuracion: 30, recompensa: 100 })
        fetchData('desafios')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const sections = [
    { id: "puntos", label: "Puntos", icon: <Award className="w-4 h-4" /> },
    { id: "rachas", label: "Rachas", icon: <Flame className="w-4 h-4" /> },
    { id: "nps", label: "NPS", icon: <ThumbsUp className="w-4 h-4" /> },
    { id: "cumpleanios", label: "Cumpleaños", icon: <Gift className="w-4 h-4" /> },
    { id: "desafios", label: "Desafíos", icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Retención</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Sistema de <span className="text-outline">Retención</span>
        </h1>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
              activeSection === s.id 
                ? 'text-[#02F5D4] border-b-2 border-[#02F5D4]' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-slate-500">Cargando...</div>
        </div>
      )}

      {!loading && activeSection === "puntos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-white/10 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#02F5D4]" />
                <h3 className="text-white text-xl font-bold">Leaderboard de Puntos</h3>
              </div>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {puntosLeaderboard.map((p) => (
                <div key={p.usuarioId} className="flex items-center justify-between p-3 border-l-2 border-white/10 hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold font-mono w-6 ${p.rank <= 3 ? 'text-[#02F5D4]' : 'text-slate-500'}`}>
                      {p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank-1] : `#${p.rank}`}
                    </span>
                    <div className="w-8 h-8 bg-white/10 rounded-full overflow-hidden">
                      {p.foto ? <img src={p.foto} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">{p.nombre[0]}</div>}
                    </div>
                    <span className="text-white text-sm">{p.nombre}</span>
                  </div>
                  <span className="text-[#02F5D4] text-sm font-mono font-bold">{p.totalPuntos.toLocaleString()} pts</span>
                </div>
              ))}
              {puntosLeaderboard.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>}
            </div>
          </div>

          <div className="border border-white/10 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white text-xl font-bold">Ganar Puntos</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-white/10">
                <p className="text-white text-sm font-bold">Check-In diario</p>
                <p className="text-slate-500 text-xs mt-1">+10 puntos por cada visita</p>
              </div>
              <div className="p-4 border border-white/10">
                <p className="text-white text-sm font-bold">Racha de 7 días</p>
                <p className="text-slate-500 text-xs mt-1">+50 puntos bonus semanal</p>
              </div>
              <div className="p-4 border border-white/10">
                <p className="text-white text-sm font-bold">Referir un amigo</p>
                <p className="text-slate-500 text-xs mt-1">+100 puntos por referido</p>
              </div>
              <div className="p-4 border border-white/10">
                <p className="text-white text-sm font-bold">Completar desafío</p>
                <p className="text-slate-500 text-xs mt-1">Hasta +500 puntos</p>
              </div>
              <div className="p-4 border border-white/10">
                <p className="text-white text-sm font-bold">Cumpleaños</p>
                <p className="text-slate-500 text-xs mt-1">+200 puntos de regalo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && activeSection === "rachas" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-white/10 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <h3 className="text-white text-xl font-bold">Rachas de Asistencia</h3>
              </div>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {rachasLeaderboard.map((r) => (
                <div key={r.usuarioId} className="flex items-center justify-between p-3 border-l-2 border-white/10 hover:border-orange-400 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono w-6 text-slate-400">#{r.rank}</span>
                    <div className="w-8 h-8 bg-white/10 rounded-full overflow-hidden">
                      {r.foto ? <img src={r.foto} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">{r.nombre[0]}</div>}
                    </div>
                    <span className="text-white text-sm">{r.nombre}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-orange-400 text-sm font-bold font-mono">{r.rachaActual} días</span>
                    <span className="text-slate-500 text-xs">Máx: {r.rachaMaxima}</span>
                  </div>
                </div>
              ))}
              {rachasLeaderboard.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>}
            </div>
          </div>

          <div className="border border-white/10 p-6">
            <div className="mb-4">
              <h3 className="text-white text-xl font-bold">Bonus por Racha</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">7 días</p>
                  <p className="text-slate-500 text-xs">Una semana completa</p>
                </div>
                <span className="text-green-400 text-sm font-mono">+50 pts</span>
              </div>
              <div className="p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">14 días</p>
                  <p className="text-slate-500 text-xs">Dos semanas</p>
                </div>
                <span className="text-green-400 text-sm font-mono">+100 pts</span>
              </div>
              <div className="p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">30 días</p>
                  <p className="text-slate-500 text-xs">Un mes imparable</p>
                </div>
                <span className="text-green-400 text-sm font-mono">+300 pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && activeSection === "nps" && npsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="border border-white/10 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-[#02F5D4]" />
                <h3 className="text-white text-xl font-bold">NPS Score</h3>
              </div>
            </div>
            <div className="text-center py-8">
              <p className="text-6xl font-black text-white mb-2">{npsData.nps}</p>
              <p className={`text-sm font-mono ${npsData.nps >= 50 ? 'text-green-400' : npsData.nps >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {npsData.nps >= 50 ? 'Excelente' : npsData.nps >= 0 ? 'Bueno' : 'Necesita mejora'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-400">Promotores (9-10)</span>
                <span>{npsData.promoters}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-400">Pasivos (7-8)</span>
                <span>{npsData.passives}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-400">Detractores (0-6)</span>
                <span>{npsData.detractors}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Promedio</span>
                <span>{npsData.promedio}/10</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total encuestas</span>
                <span>{npsData.total}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300 overflow-hidden">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#02F5D4]" />
                <h3 className="text-white text-xl font-bold">Comentarios Recientes</h3>
              </div>
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {npsData.encuestas.map((e: any) => (
                <div key={e.id} className="p-3 border-l-2 border-white/10 hover:border-[#02F5D4] bg-white/[0.01] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{e.usuario?.nombre || 'Anónimo'}</span>
                    <span className={`text-sm font-mono font-bold ${e.puntuacion >= 9 ? 'text-green-400' : e.puntuacion >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {e.puntuacion}/10
                    </span>
                  </div>
                  {e.comentario && <p className="text-slate-400 text-xs">{e.comentario}</p>}
                </div>
              ))}
              {npsData.encuestas.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Sin comentarios</p>}
            </div>
          </div>
        </div>
      )}

      {!loading && activeSection === "cumpleanios" && (
        <div className="border border-white/10 p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <h3 className="text-white text-xl font-bold">Próximos Cumpleaños</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cumpleanios.map((c) => (
              <div key={c.id} className="p-4 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-full overflow-hidden">
                    {c.foto ? <img src={c.foto} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500">{c.nombre[0]}</div>}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{c.nombre}</p>
                    <p className="text-slate-500 text-xs">{new Date(c.fechaNacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-mono font-bold ${c.diasRestantes <= 7 ? 'text-pink-400' : 'text-slate-400'}`}>
                    {c.diasRestantes === 0 ? '¡Hoy!' : `${c.diasRestantes} días`}
                  </span>
                  {c.recompensaCanjeada ? (
                    <span className="text-green-400 text-xs">Canjeado</span>
                  ) : (
                    <span className="text-yellow-400 text-xs">Pendiente</span>
                  )}
                </div>
              </div>
            ))}
            {cumpleanios.length === 0 && <p className="text-slate-500 text-sm col-span-full text-center py-8">Sin cumpleaños próximos</p>}
          </div>
        </div>
      )}

      {!loading && activeSection === "desafios" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border border-white/10 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white text-xl font-bold">Desafíos Activos</h3>
              </div>
            </div>
            <div className="space-y-2">
              {desafios.map((d) => (
                <div key={d.id} className="p-4 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">{d.nombre}</h4>
                    <span className="text-xs text-slate-500 border border-white/10 px-2 py-0.5">{d.tipo}</span>
                  </div>
                  {d.descripcion && <p className="text-slate-400 text-sm mb-2">{d.descripcion}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Meta: {d.meta}</span>
                    <span>Duración: {d.diasDuracion}d</span>
                    {d.recompensa > 0 && <span className="text-yellow-400">+{d.recompensa} pts</span>}
                    <span>{d._count.participantes} participantes</span>
                  </div>
                </div>
              ))}
              {desafios.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Sin desafíos activos</p>}
            </div>
          </div>

          <div className="border border-white/10 p-6">
            <div className="mb-4">
              <h3 className="text-white text-xl font-bold">Crear Desafío</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newChallenge.nombre}
                  onChange={e => setNewChallenge(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                  placeholder="Ej: Reto 30 días"
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Descripción</label>
                <textarea
                  value={newChallenge.descripcion}
                  onChange={e => setNewChallenge(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                  rows={2}
                  placeholder="Descripción del desafío"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Meta (días)</label>
                  <input
                    type="number"
                    value={newChallenge.meta}
                    onChange={e => setNewChallenge(p => ({ ...p, meta: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Duración</label>
                  <input
                    type="number"
                    value={newChallenge.diasDuracion}
                    onChange={e => setNewChallenge(p => ({ ...p, diasDuracion: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Recompensa (puntos)</label>
                <input
                  type="number"
                  value={newChallenge.recompensa}
                  onChange={e => setNewChallenge(p => ({ ...p, recompensa: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleCreateChallenge}
                disabled={!newChallenge.nombre}
                className="w-full py-3 bg-[#02F5D4] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#02F5D4]/90 transition-colors disabled:opacity-50"
              >
                Crear Desafío
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
