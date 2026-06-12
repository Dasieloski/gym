"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash, Dumbbell } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

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

export default function RutinasEntrenadorTab() {
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

  const fetchData = async () => {
    try {
      const [rutinasRes, clientesRes] = await Promise.all([
        fetch("/api/entrenador/rutinas"),
        fetch("/api/entrenador/clientes"),
      ]);
      if (rutinasRes.ok) setRutinas(await rutinasRes.json());
      if (clientesRes.ok) {
        const data = await clientesRes.json();
        setClientes(data.clientes || data || []);
      }
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

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

    const res = await fetch("/api/entrenador/rutinas", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowModal(false);
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta rutina?")) return;
    await fetch(`/api/entrenador/rutinas?id=${id}`, { method: "DELETE" });
    fetchData();
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Rutinas</p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
          Planes de <span className="text-outline">Entrenamiento</span>
        </h1>
        <p className="text-slate-400 text-base max-w-2xl">Crea y asigna rutinas de ejercicios a tus clientes.</p>
      </motion.div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" placeholder="Buscar rutinas..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4] placeholder:text-white/30"
          />
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap rounded-xl">
          <Plus size={16} /> Nueva Rutina
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((rutina) => (
          <GlassCard key={rutina.id}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white font-heading">{rutina.nombre}</h3>
                  <p className="text-sm text-white/40">{rutina.cliente.nombre}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(rutina)} className="text-white/30 hover:text-[#02F5D4] transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(rutina.id)} className="text-white/30 hover:text-red-400 transition-colors">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              {rutina.descripcion && (
                <p className="text-sm text-white/50 mb-3">{rutina.descripcion}</p>
              )}
              <div className="space-y-2">
                {rutina.ejercicios.map((ej, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-white/[0.03] p-2 rounded">
                    <Dumbbell size={12} className="text-[#02F5D4] shrink-0" />
                    <span className="text-white/70">{ej.nombre}</span>
                    <span className="text-white/30 ml-auto">{ej.series}x{ej.repeticiones}</span>
                  </div>
                ))}
              </div>
              {rutina.ejercicios.length === 0 && (
                <p className="text-white/20 text-sm text-center py-4">Sin ejercicios</p>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-white/30 text-center py-12">No hay rutinas creadas</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{editId ? "Editar" : "Nueva"} Rutina</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Nombre</label>
                    <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Cliente</label>
                    <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]">
                      <option value="" className="bg-[#050505]">Seleccionar</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#050505]">{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                  <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/50 text-xs uppercase tracking-wider">Ejercicios</label>
                    <button onClick={addEjercicio} className="text-[#02F5D4] text-xs hover:underline">+ Agregar</button>
                  </div>
                  <div className="space-y-3">
                    {form.ejercicios.map((ej, idx) => (
                      <div key={idx} className="bg-white/[0.03] p-3 rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/30 text-xs">#{idx + 1}</span>
                          {form.ejercicios.length > 1 && (
                            <button onClick={() => removeEjercicio(idx)} className="text-red-400/50 hover:text-red-400"><Trash size={12} /></button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Nombre" value={ej.nombre} onChange={(e) => updateEjercicio(idx, "nombre", e.target.value)} className="bg-white/5 border border-white/10 p-2 text-white text-xs focus:outline-none focus:border-[#02F5D4] placeholder:text-white/20" />
                          <select value={ej.diaSemana || ""} onChange={(e) => updateEjercicio(idx, "diaSemana", e.target.value)} className="bg-white/5 border border-white/10 p-2 text-white text-xs focus:outline-none focus:border-[#02F5D4]">
                            <option value="" className="bg-[#050505]">Sin día</option>
                            {DIAS_SEMANA.map(d => <option key={d} value={d} className="bg-[#050505]">{d}</option>)}
                          </select>
                          <input type="number" placeholder="Series" value={ej.series} onChange={(e) => updateEjercicio(idx, "series", parseInt(e.target.value) || 0)} className="bg-white/5 border border-white/10 p-2 text-white text-xs focus:outline-none focus:border-[#02F5D4] placeholder:text-white/20" />
                          <input type="number" placeholder="Repeticiones" value={ej.repeticiones} onChange={(e) => updateEjercicio(idx, "repeticiones", parseInt(e.target.value) || 0)} className="bg-white/5 border border-white/10 p-2 text-white text-xs focus:outline-none focus:border-[#02F5D4] placeholder:text-white/20" />
                          <input type="number" step="0.5" placeholder="Peso (kg)" value={ej.peso ?? ""} onChange={(e) => updateEjercicio(idx, "peso", e.target.value ? parseFloat(e.target.value) : undefined)} className="bg-white/5 border border-white/10 p-2 text-white text-xs focus:outline-none focus:border-[#02F5D4] placeholder:text-white/20" />
                          <input type="text" placeholder="Notas" value={ej.notas || ""} onChange={(e) => updateEjercicio(idx, "notas", e.target.value)} className="bg-white/5 border border-white/10 p-2 text-white text-xs focus:outline-none focus:border-[#02F5D4] placeholder:text-white/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all duration-300 rounded-xl">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 rounded-xl">Guardar</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
