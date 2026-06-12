"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Filter, TrendingDown, DollarSign, Edit3, Trash2, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface Gasto {
  id: number; categoria: string; descripcion: string;
  monto: number; moneda: string; fecha: string;
  metodoPago?: string; recurrente: boolean; periodicidad?: string;
  createdAt: string;
}

const categorias = ["ALQUILER", "ELECTRICIDAD", "AGUA", "MANTENIMIENTO", "SALARIO", "SUMINISTROS", "PUBLICIDAD", "OTRO"];
const metodosPago = ["EFECTIVO", "TRANSFERENCIA", "ENZONA", "OTRO"];
const monedas = ["CUP", "USD", "EUR", "MLC"];

export default function ExpensesTab() {
  const { data: session } = useSession();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [totales, setTotales] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoria: "OTRO", descripcion: "", monto: "", moneda: "CUP",
    fecha: new Date().toISOString().split("T")[0], metodoPago: "EFECTIVO",
    recurrente: false, periodicidad: "",
  });

  const fetchGastos = async () => {
    const params = new URLSearchParams();
    if (filterCategoria !== "todas") params.set("categoria", filterCategoria);
    const res = await fetch(`/api/admin/gastos?${params}`);
    if (res.ok) { const data = await res.json(); setGastos(data.gastos); setTotales(data.totales || {}); }
  };

  useEffect(() => { fetchGastos(); }, []);
  useEffect(() => { fetchGastos(); }, [filterCategoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.monto) { toast.error("Completa los campos"); return; }
    const url = editingId ? `/api/admin/gastos` : `/api/admin/gastos`;
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...formData, id: editingId, monto: parseFloat(formData.monto) } : { ...formData, monto: parseFloat(formData.monto), registradoPor: session?.user?.id };

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      toast.success(editingId ? "Gasto actualizado" : "Gasto registrado");
      setShowForm(false); setEditingId(null); resetForm(); fetchGastos();
    } else toast.error("Error al guardar");
  };

  const handleEdit = (gasto: Gasto) => {
    setEditingId(gasto.id);
    setFormData({
      categoria: gasto.categoria, descripcion: gasto.descripcion,
      monto: gasto.monto.toString(), moneda: gasto.moneda,
      fecha: gasto.fecha.split("T")[0], metodoPago: gasto.metodoPago || "EFECTIVO",
      recurrente: gasto.recurrente, periodicidad: gasto.periodicidad || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("�Eliminar este gasto?")) return;
    const res = await fetch(`/api/admin/gastos?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Gasto eliminado"); fetchGastos(); }
    else toast.error("Error al eliminar");
  };

  const resetForm = () => {
    setFormData({ categoria: "OTRO", descripcion: "", monto: "", moneda: "CUP", fecha: new Date().toISOString().split("T")[0], metodoPago: "EFECTIVO", recurrente: false, periodicidad: "" });
  };

  const filteredGastos = gastos.filter(g =>
    g.descripcion.toLowerCase().includes(search.toLowerCase()) || g.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const totalGeneral = Object.entries(totales).map(([moneda, total]) => `${total.toLocaleString()} ${moneda}`).join(" | ");

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Finanzas</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Control de <span className="text-outline">Gastos</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">Registro y categorizacion de todos los gastos del gimnasio.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-8">
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Total Gastos</p>
          <p className="text-2xl font-bold text-red-400">{totalGeneral || "0 CUP"}</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Este Mes</p>
          <p className="text-2xl font-bold text-white">{gastos.filter(g => new Date(g.fecha).getMonth() === new Date().getMonth()).length} registros</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Recurrentes</p>
          <p className="text-2xl font-bold text-yellow-400">{gastos.filter(g => g.recurrente).length}</p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Categorias</p>
          <p className="text-2xl font-bold text-[#02F5D4]">{new Set(gastos.map(g => g.categoria)).size}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
        </div>
        <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-2 py-2 text-xs text-white focus:outline-none">
          <option value="todas" className="bg-[#050505]">Todas</option>
          {categorias.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
        </select>
        <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center gap-2">
          <Plus size={16} /> Nuevo Gasto
        </button>
      </div>

      <div className="space-y-1">
        <AnimatePresence>
          {filteredGastos.map((gasto, i) => (
            <motion.div key={gasto.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="group flex items-center gap-4 p-4 border-l-2 border-white/10 hover:border-red-400/50 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
              <TrendingDown size={16} className="text-red-400 shrink-0" />
              <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-3">
                  <p className="text-white font-bold truncate">{gasto.descripcion}</p>
                  <p className="text-slate-500 text-xs mt-1">{gasto.categoria}</p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Monto</p>
                  <p className="text-red-400 font-bold font-mono">{gasto.monto.toLocaleString()} {gasto.moneda}</p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Pago</p>
                  <p className="text-slate-300 text-sm">{gasto.metodoPago || "-"}</p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Fecha</p>
                  <p className="text-slate-300 text-sm">{new Date(gasto.fecha).toLocaleDateString("es-ES")}</p>
                </div>
                <div className="col-span-6 md:col-span-1">
                  {gasto.recurrente && <span className="text-yellow-400 text-xs">Recurrente</span>}
                </div>
                <div className="col-span-12 md:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(gasto)} className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(gasto.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredGastos.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/10">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay gastos registrados</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/50lg max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">{editingId ? "Editar" : "Nuevo"}</p>
                  <h3 className="text-white font-bold text-xl">{editingId ? "Modificar Gasto" : "Registrar Gasto"}</h3>
                </div>
                <button onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }} className="p-2 hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Categoria</label>
                    <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none">
                      {categorias.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Moneda</label>
                    <select value={formData.moneda} onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none">
                      {monedas.map(m => <option key={m} value={m} className="bg-[#050505]">{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Descripcion</label>
                  <input type="text" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Monto</label>
                    <input type="number" step="0.01" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Metodo de pago</label>
                    <select value={formData.metodoPago} onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none">
                      {metodosPago.map(m => <option key={m} value={m} className="bg-[#050505]">{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Fecha</label>
                  <input type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.recurrente} onChange={(e) => setFormData({ ...formData, recurrente: e.target.checked })}
                      className="accent-[#02F5D4]" />
                    Gasto recurrente
                  </label>
                  {formData.recurrente && (
                    <select value={formData.periodicidad} onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value })}
                      className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white text-xs focus:outline-none">
                      <option value="MENSUAL" className="bg-[#050505]">Mensual</option>
                      <option value="TRIMESTRAL" className="bg-[#050505]">Trimestral</option>
                      <option value="ANUAL" className="bg-[#050505]">Anual</option>
                    </select>
                  )}
                </div>
                <button type="submit" className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">
                  {editingId ? "Actualizar Gasto" : "Registrar Gasto"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
