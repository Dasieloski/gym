"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Snowflake, Sun, AlertTriangle, Check, X, Users, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { ClientType } from "@/types/client";

interface FreezeInfo {
  id: number; membresiaId: number; fechaInicio: string; fechaFin: string;
  motivo: string; activa: boolean;
}

export default function FreezeTab() {
  const [clientes, setClientes] = useState<ClientType[]>([]);
  const [freezes, setFreezes] = useState<Record<number, FreezeInfo[]>>({});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState<ClientType | null>(null);
  const [formData, setFormData] = useState({
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    motivo: "PERSONAL",
  });

  const fetchClientes = async () => {
    const res = await fetch("/api/admin/clientes");
    if (res.ok) { const data = await res.json(); setClientes(data.clientes || []); }
  };

  const fetchFreezes = async (clienteId?: number) => {
    const res = await fetch("/api/admin/memberships");
    if (res.ok) {
      const data = await res.json();
      setFreezes(prev => {
        const next = { ...prev };
        data.forEach((c: any) => {
          if (c.membresiaActual?.congelada) {
            next[c.id] = [{
              id: 0, membresiaId: c.membresiaActual.id,
              fechaInicio: "", fechaFin: "", motivo: c.membresiaActual.tipo, activa: c.membresiaActual.congelada
            }];
          }
        });
        return next;
      });
    }
  };

  useEffect(() => { fetchClientes(); fetchFreezes(); }, []);

  const handleFreeze = async (cliente: ClientType) => {
    const membresiaId = cliente.membresiaActual?.id;
    if (!membresiaId) { toast.error("El cliente no tiene membresía activa"); return; }

    const res = await fetch("/api/admin/congelar-membresia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        membresiaId, fechaInicio: formData.fechaInicio, fechaFin: formData.fechaFin,
        motivo: formData.motivo, activa: true,
      }),
    });
    if (res.ok) {
      toast.success("Membresía congelada");
      setShowForm(null);
      fetchFreezes();
    } else toast.error("Error al congelar");
  };

  const handleUnfreeze = async (membresiaId: number) => {
    if (!confirm("¿Descongelar esta membresía?")) return;
    const res = await fetch("/api/admin/congelar-membresia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membresiaId, activa: false }),
    });
    if (res.ok) { toast.success("Membresía descongelada"); fetchFreezes(); }
    else toast.error("Error al descongelar");
  };

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toString().includes(search)
  );

  const clientesConMembresia = filteredClientes.filter(c => c.membresiaActual);

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Congelación</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Pausar <span className="text-outline">Membresías</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Congela membresías por lesión, viaje o motivos personales.
        </p>
      </motion.div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
      </div>

      <div className="space-y-1">
        {clientesConMembresia.map((cliente, i) => {
          const isFrozen = freezes[cliente.id]?.some(f => f.activa);
          return (
            <motion.div key={cliente.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={`group flex items-center gap-4 p-4 border-l-2 transition-all ${
                isFrozen ? "border-l-blue-500 bg-blue-500/5" : "border-l-white/10 hover:border-l-[#02F5D4]/50 bg-white/[0.01] hover:bg-white/[0.03]"
              }`}>
              <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                {isFrozen ? <Snowflake size={18} className="text-blue-400" /> : <Users size={18} className="text-white/40" />}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-3">
                  <p className="text-white font-bold truncate">{cliente.nombre}</p>
                  <p className="text-slate-600 text-xs font-mono">ID: {cliente.id}</p>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Membresía</p>
                  <p className="text-white text-sm">{cliente.membresiaActual?.tipo || "-"}</p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Estado</p>
                  {isFrozen ? (
                    <span className="text-blue-400 text-xs font-bold flex items-center gap-1">
                      <Snowflake size={12} /> Congelada
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-xs">Activa</span>
                  )}
                </div>
                <div className="col-span-12 md:col-span-4 flex justify-end gap-2">
                  {isFrozen ? (
                    <button onClick={() => cliente.membresiaActual?.id && handleUnfreeze(cliente.membresiaActual.id)}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1">
                      <Sun size={14} /> Descongelar
                    </button>
                  ) : (
                    <button onClick={() => setShowForm(cliente)}
                      className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-colors flex items-center gap-1">
                      <Snowflake size={14} /> Congelar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {clientesConMembresia.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/10">
            <Snowflake className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay clientes con membresía activa</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/50md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Congelar</p>
                  <h3 className="text-white font-bold text-xl">{showForm.nombre}</h3>
                </div>
                <button onClick={() => setShowForm(null)} className="p-2 hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Motivo</label>
                  <select value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none">
                    <option value="PERSONAL" className="bg-[#050505]">Personal</option>
                    <option value="LESION" className="bg-[#050505]">Lesión</option>
                    <option value="VIAJE" className="bg-[#050505]">Viaje</option>
                    <option value="OTRO" className="bg-[#050505]">Otro</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Desde</label>
                    <input type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Hasta</label>
                    <input type="date" value={formData.fechaFin} onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-blue-300 text-sm">Durante la congelación, el tiempo de la membresía se detiene y se reanuda al descongelar.</p>
                </div>
                <button onClick={() => handleFreeze(showForm)}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2">
                  <Snowflake size={18} /> Congelar Membresía
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
