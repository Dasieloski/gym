"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit, Trash, X, Dumbbell, Users } from "lucide-react";

interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  series: number;
  repeticiones: number;
  peso?: number;
  diaSemana?: string;
  orden: number;
  notas?: string;
}

interface Rutina {
  id: number;
  nombre: string;
  descripcion?: string;
  clienteId: number;
  activa: boolean;
  createdAt: string;
  ejercicios: Ejercicio[];
  cliente: { id: number; nombre: string };
  creador: { id: number; nombre: string };
}

const DIAS_SEMANA = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];

export default function RutinasTab() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [clientes, setClientes] = useState<{ id: number; nombre: string }[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<{
    nombre: string;
    descripcion: string;
    clienteId: string;
    ejercicios: Ejercicio[];
  }>({ nombre: "", descripcion: "", clienteId: "", ejercicios: [] });

  const fetchRutinas = async () => {
    try {
      const res = await fetch("/api/admin/rutinas");
      if (res.ok) setRutinas(await res.json());
    } catch {}
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/admin/clientes");
      if (res.ok) {
        const data = await res.json();
        setClientes(data.clientes || []);
      }
    } catch {}
  };

  useEffect(() => { fetchRutinas(); fetchClientes(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ nombre: "", descripcion: "", clienteId: "", ejercicios: [{ nombre: "", descripcion: "", series: 3, repeticiones: 10, peso: undefined, diaSemana: "", orden: 0, notas: "" }] });
    setShowModal(true);
  };

  const openEdit = (r: Rutina) => {
    setEditId(r.id);
    setForm({
      nombre: r.nombre,
      descripcion: r.descripcion || "",
      clienteId: r.clienteId.toString(),
      ejercicios: r.ejercicios.length > 0 ? r.ejercicios : [{ nombre: "", descripcion: "", series: 3, repeticiones: 10, peso: undefined, diaSemana: "", orden: 0, notas: "" }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.clienteId) return;
    const body = {
      ...(editId ? { id: editId } : {}),
      nombre: form.nombre,
      descripcion: form.descripcion,
      clienteId: parseInt(form.clienteId),
      ejercicios: form.ejercicios.filter(e => e.nombre.trim()),
    };

    const res = await fetch("/api/admin/rutinas", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowModal(false);
      fetchRutinas();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta rutina?")) return;
    await fetch(`/api/admin/rutinas?id=${id}`, { method: "DELETE" });
    fetchRutinas();
  };

  const addEjercicio = () => {
    setForm(prev => ({
      ...prev,
      ejercicios: [...prev.ejercicios, { nombre: "", descripcion: "", series: 3, repeticiones: 10, peso: undefined, diaSemana: "", orden: prev.ejercicios.length, notas: "" }],
    }));
  };

  const updateEjercicio = (idx: number, field: keyof Ejercicio, value: string | number | undefined) => {
    setForm(prev => {
      const ejercicios = [...prev.ejercicios];
      ejercicios[idx] = { ...ejercicios[idx], [field]: value };
      return { ...prev, ejercicios };
    });
  };

  const removeEjercicio = (idx: number) => {
    setForm(prev => ({ ...prev, ejercicios: prev.ejercicios.filter((_, i) => i !== idx) }));
  };

  const filtered = rutinas.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    r.cliente.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Rutinas</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Planes de <span className="text-outline">Entrenamiento</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">Crea y asigna rutinas de ejercicios a tus clientes.</p>
      </motion.div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" placeholder="Buscar rutinas..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#02F5D4]/30 transition-all">
          <Plus size={16} /> Nueva Rutina
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rutina) => (
          <div key={rutina.id} className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300 group">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2272FF]/20 to-[#02F5D4]/20 flex items-center justify-center shrink-0">
                <Dumbbell size={22} className="text-[#02F5D4]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-lg truncate">{rutina.nombre}</h3>
                <p className="text-slate-500 text-xs">Para: {rutina.cliente.nombre}</p>
                {rutina.descripcion && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{rutina.descripcion}</p>}
              </div>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-slate-500 text-xs font-mono">{rutina.ejercicios.length} ejercicio(s)</p>
              {rutina.ejercicios.slice(0, 3).map((e, i) => (
                <p key={i} className="text-white/60 text-xs truncate">{e.nombre} · {e.series}x{e.repeticiones}</p>
              ))}
              {rutina.ejercicios.length > 3 && <p className="text-white/30 text-xs">+{rutina.ejercicios.length - 3} más</p>}
            </div>
            <div className="flex gap-2 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(rutina)} className="flex-1 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 text-white transition-colors">
                <Edit size={14} className="inline mr-1" /> Editar
              </button>
              <button onClick={() => handleDelete(rutina.id)} className="px-3 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                <Trash size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Dumbbell size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay rutinas creadas</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/502xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">{editId ? "Editar" : "Nueva"} Rutina</p>
                  <h3 className="text-white font-bold text-2xl">{editId ? "Modificar Rutina" : "Crear Rutina"}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Nombre</label>
                  <input type="text" value={form.nombre}
                    onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Descripción</label>
                  <textarea value={form.descripcion}
                    onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full bg-transparent border border-white/20 focus:border-[#02F5D4] p-3 text-white focus:outline-none transition-colors resize-none h-20"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Cliente</label>
                  <select value={form.clienteId}
                    onChange={(e) => setForm(prev => ({ ...prev, clienteId: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-[#050505]">Seleccionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id.toString()} className="bg-[#050505]">{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-slate-500 text-xs uppercase tracking-wider">Ejercicios</label>
                    <button onClick={addEjercicio} className="text-xs text-[#02F5D4] hover:underline flex items-center gap-1">
                      <Plus size={12} /> Agregar ejercicio
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.ejercicios.map((ej, idx) => (
                      <div key={idx} className="p-4 border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/50 text-xs font-mono">#{idx + 1}</span>
                          <button onClick={() => removeEjercicio(idx)} className="text-red-400 hover:text-red-300">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <input type="text" placeholder="Nombre del ejercicio" value={ej.nombre}
                              onChange={(e) => updateEjercicio(idx, "nombre", e.target.value)}
                              className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-1 text-white text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 text-[10px]">Series</label>
                            <input type="number" value={ej.series}
                              onChange={(e) => updateEjercicio(idx, "series", parseInt(e.target.value) || 1)}
                              className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-1 text-white text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 text-[10px]">Repeticiones</label>
                            <input type="number" value={ej.repeticiones}
                              onChange={(e) => updateEjercicio(idx, "repeticiones", parseInt(e.target.value) || 1)}
                              className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-1 text-white text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 text-[10px]">Peso (kg)</label>
                            <input type="number" value={ej.peso || ""}
                              onChange={(e) => updateEjercicio(idx, "peso", e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-1 text-white text-sm focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 text-[10px]">Día</label>
                            <select value={ej.diaSemana || ""}
                              onChange={(e) => updateEjercicio(idx, "diaSemana", e.target.value)}
                              className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-1 text-white text-sm focus:outline-none"
                            >
                              <option value="" className="bg-[#050505]">Cualquier día</option>
                              {DIAS_SEMANA.map(d => (
                                <option key={d} value={d} className="bg-[#050505]">{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <input type="text" placeholder="Notas (opcional)" value={ej.notas || ""}
                              onChange={(e) => updateEjercicio(idx, "notas", e.target.value)}
                              className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-1 text-white text-sm focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white font-bold transition-all hover:shadow-lg hover:shadow-[#02F5D4]/30">
                    {editId ? "Guardar Cambios" : "Crear Rutina"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
