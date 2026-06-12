"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, MessageSquare, StickyNote, Trash2, Filter, User } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface Nota {
  id: number;
  contenido: string;
  categoria: string;
  clienteId: number;
  creadoPor: number;
  createdAt: string;
  cliente: { id: number; nombre: string; foto?: string };
}

const categorias = ["LESION", "OBJETIVO", "OBSERVACION", "QUEJA"];
const colors: Record<string, string> = {
  LESION: "border-l-red-500 bg-red-500/5",
  OBJETIVO: "border-l-emerald-500 bg-emerald-500/5",
  OBSERVACION: "border-l-blue-500 bg-blue-500/5",
  QUEJA: "border-l-yellow-500 bg-yellow-500/5",
};

export default function NotesTab() {
  const { data: session } = useSession();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [clientes, setClientes] = useState<{ id: number; nombre: string }[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ contenido: "", categoria: "OBSERVACION", clienteId: "" });

  const fetchNotas = async () => {
    const params = new URLSearchParams();
    if (filterCategoria !== "todas") params.set("categoria", filterCategoria);
    const res = await fetch(`/api/admin/notas?${params}`);
    if (res.ok) setNotas(await res.json());
  };

  const fetchClientes = async () => {
    const res = await fetch("/api/admin/clientes");
    if (res.ok) {
      const data = await res.json();
      setClientes(data.clientes || []);
    }
  };

  useEffect(() => { fetchNotas(); fetchClientes(); }, []);
  useEffect(() => { fetchNotas(); }, [filterCategoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contenido || !formData.clienteId) {
      toast.error("Completa todos los campos"); return;
    }
    const res = await fetch("/api/admin/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, clienteId: parseInt(formData.clienteId), creadoPor: session?.user?.id }),
    });
    if (res.ok) {
      toast.success("Nota creada");
      setShowForm(false);
      setFormData({ contenido: "", categoria: "OBSERVACION", clienteId: "" });
      fetchNotas();
    } else toast.error("Error al crear nota");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("�Eliminar esta nota?")) return;
    const res = await fetch(`/api/admin/notas?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Nota eliminada"); fetchNotas(); }
    else toast.error("Error al eliminar");
  };

  const filteredNotas = notas.filter(n =>
    n.contenido.toLowerCase().includes(search.toLowerCase()) ||
    n.cliente.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Notas</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Seguimiento de <span className="text-outline">Clientes</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">Observaciones, lesiones y seguimiento de cada cliente.</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
        </div>
        <select value={filterCategoria} onChange={(e) => { setFilterCategoria(e.target.value); }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-2 py-2 text-xs text-white focus:outline-none">
          <option value="todas" className="bg-[#050505]">Todas</option>
          {categorias.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
        </select>
        <button onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Nueva Nota
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filteredNotas.map((nota, i) => (
            <motion.div key={nota.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={`group flex items-start gap-4 p-4 border-l-4 border-white/10 hover:bg-white/[0.02] transition-all ${colors[nota.categoria] || "border-l-white/10"}`}>
              <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                <User size={18} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-bold text-sm">{nota.cliente.nombre}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-white/5">{nota.categoria}</span>
                  <span className="text-slate-600 text-xs">{new Date(nota.createdAt).toLocaleDateString("es-ES")}</span>
                </div>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{nota.contenido}</p>
              </div>
              <button onClick={() => handleDelete(nota.id)}
                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/10">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredNotas.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/10">
            <StickyNote className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay notas registradas</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/50lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Nueva</p>
                  <h3 className="text-white font-bold text-xl">Registrar Nota</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Cliente</label>
                  <select value={formData.clienteId} onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" required>
                    <option value="" className="bg-[#050505]">Seleccionar cliente</option>
                    {clientes.map((c) => <option key={c.id} value={c.id} className="bg-[#050505]">{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Categor�a</label>
                  <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none">
                    {categorias.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Contenido</label>
                  <textarea value={formData.contenido} onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                    rows={4} className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] p-3 text-white focus:outline-none resize-none" required />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl">
                  Guardar Nota
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
