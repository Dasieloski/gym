"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Edit, Trash, X, ChevronLeft, ChevronRight, RefreshCw, Users, DollarSign, Activity } from "lucide-react";
import { toast } from "react-toastify";

interface MetaItem {
  id: number;
  nombre: string;
  tipo: string;
  valorMeta: number;
  descripcion?: string;
  activa: boolean;
  actual: number;
  progreso: number;
}

const TIPOS_META = [
  { value: "CLIENTES", label: "Clientes Activos" },
  { value: "INGRESOS_MENSUAL", label: "Ingresos Mensuales" },
  { value: "ASISTENCIA_DIARIA", label: "Asistencias por Día" },
  { value: "PERSONALIZADA", label: "Personalizada (sin cálculo automático)" },
];

export default function MetasTab() {
  const [metas, setMetas] = useState<MetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MetaItem | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const [form, setForm] = useState({ nombre: "", tipo: "CLIENTES", valorMeta: "", descripcion: "" });

  const fetchMetas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metas");
      if (res.ok) {
        const data = await res.json();
        setMetas(data.metas || []);
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchMetas(); }, []);

  const resetForm = () => setForm({ nombre: "", tipo: "CLIENTES", valorMeta: "", descripcion: "" });

  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };

  const openEdit = (m: MetaItem) => {
    setEditing(m);
    setForm({ nombre: m.nombre, tipo: m.tipo, valorMeta: m.valorMeta.toString(), descripcion: m.descripcion || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.valorMeta) { toast.error("Nombre y valor son requeridos"); return; }
    try {
      const url = editing ? "/api/admin/metas" : "/api/admin/metas";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form, valorMeta: parseInt(form.valorMeta) } : { ...form, valorMeta: parseInt(form.valorMeta) };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? "Meta actualizada" : "Meta creada");
        setShowForm(false);
        resetForm();
        fetchMetas();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar");
      }
    } catch { toast.error("Error al guardar"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta meta?")) return;
    try {
      const res = await fetch(`/api/admin/metas?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Meta eliminada"); fetchMetas(); }
      else toast.error("Error al eliminar");
    } catch { toast.error("Error al eliminar"); }
  };

  const totalPages = Math.max(1, Math.ceil(metas.length / itemsPerPage));
  const paginated = metas.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getProgressColor = (p: number) => {
    if (p >= 100) return "bg-emerald-500";
    if (p >= 75) return "bg-[#02F5D4]";
    if (p >= 50) return "bg-[#2272FF]";
    if (p >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "CLIENTES": return <Users size={16} />;
      case "INGRESOS_MENSUAL": return <DollarSign size={16} />;
      case "ASISTENCIA_DIARIA": return <Activity size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Fase 2</p>
          <h2 className="text-white font-bold text-3xl">Metas del Gimnasio</h2>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 rounded-xl">
          <Plus size={16} /> Nueva Meta
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#02F5D4]/20 border-t-[#02F5D4] rounded-full animate-spin" />
        </div>
      ) : metas.length === 0 ? (
        <div className="border border-white/10 p-16 text-center">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No hay metas creadas</p>
          <p className="text-slate-500 text-sm mb-6">Crea tu primera meta para empezar a seguir el progreso del gimnasio</p>
          <button onClick={openCreate}
            className="px-6 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl inline-flex items-center gap-2">
            <Plus size={16} /> Crear Meta
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {paginated.map((meta, i) => (
              <motion.div
                key={meta.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`border p-5 transition-colors group ${meta.activa ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 shrink-0 ${meta.progreso >= 100 ? 'bg-emerald-500/10 text-emerald-400' : meta.progreso >= 50 ? 'bg-[#02F5D4]/10 text-[#02F5D4]' : 'bg-white/5 text-slate-400'}`}>
                      {getTipoIcon(meta.tipo)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{meta.nombre}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{TIPOS_META.find(t => t.value === meta.tipo)?.label || meta.tipo}</p>
                    </div>
                  </div>
                  <span className={`text-xl font-black font-mono shrink-0 ml-2 ${meta.progreso >= 100 ? 'text-emerald-400' : meta.progreso >= 50 ? 'text-[#02F5D4]' : 'text-red-400'}`}>
                    {meta.progreso}%
                  </span>
                </div>

                <div className="w-full h-2 bg-white/5 overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${meta.progreso}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className={`h-full ${getProgressColor(meta.progreso)}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm font-mono">
                    <span className="text-white font-bold">{meta.actual.toLocaleString()}</span>
                    <span className="text-slate-500"> / {meta.valorMeta.toLocaleString()}</span>
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(meta)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <Edit size={12} />
                    </button>
                    <button onClick={() => handleDelete(meta.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                      <Trash size={12} />
                    </button>
                  </div>
                </div>

                {meta.descripcion && (
                  <p className="text-slate-600 text-xs mt-2">{meta.descripcion}</p>
                )}
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-slate-400 text-sm">Página {page} de {totalPages} ({metas.length} metas)</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button onClick={() => { setPage(1); fetchMetas(); }}
              className="flex items-center gap-2 px-4 py-2 text-xs bg-white/5 hover:bg-white/10 text-white transition-colors">
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/50lg"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">{editing ? "Editar" : "Nueva"}</p>
                  <h3 className="text-white font-bold text-2xl">{editing ? "Editar Meta" : "Crear Meta"}</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Nombre de la Meta</label>
                  <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Llegar a 100 clientes"
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" />
                </div>

                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none">
                    {TIPOS_META.map((t) => (
                      <option key={t.value} value={t.value} className="bg-[#050505]">{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Valor Meta</label>
                  <input type="number" value={form.valorMeta} onChange={(e) => setForm({ ...form, valorMeta: e.target.value })}
                    placeholder="Ej: 100"
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" />
                </div>

                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Descripción (opcional)</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Descripción de la meta"
                    rows={2}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none resize-none" />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-bold">
                  Cancelar
                </button>
                <button onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white transition-all duration-300 rounded-xl text-sm font-bold">
                  {editing ? "Guardar Cambios" : "Crear"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
