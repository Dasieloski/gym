"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, Calendar, Plus, Trash, Settings } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

interface PagoEntrenador {
  id: number;
  entrenadorId: number;
  clienteId: number;
  monto: number;
  moneda: string;
  metodoPago: string;
  fechaPago: string;
  notas: string | null;
  cliente: { id: number; nombre: string };
}

interface Estadisticas {
  total: { monto: number; count: number };
  esteMes: { monto: number; count: number };
  estaSemana: { monto: number; count: number };
  clientesUnicos: { id: number; nombre: string }[];
  ultimosPagos: PagoEntrenador[];
}

export default function PagosEntrenadorTab() {
  const [pagos, setPagos] = useState<PagoEntrenador[]>([]);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [clientes, setClientes] = useState<{ id: number; nombre: string }[]>([]);
  const [precio, setPrecio] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({ clienteId: "", monto: "", metodoPago: "EFECTIVO", notas: "" });
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  const fetchPagos = async () => {
    try {
      const [pagosRes, statsRes, clientesRes, precioRes] = await Promise.all([
        fetch("/api/entrenador/pagos"),
        fetch("/api/entrenador/estadisticas"),
        fetch("/api/entrenador/clientes"),
        fetch("/api/entrenador/precios"),
      ]);
      if (pagosRes.ok) setPagos(await pagosRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (clientesRes.ok) {
        const data = await clientesRes.json();
        setClientes(data.clientes || data || []);
      }
      if (precioRes.ok) {
        const data = await precioRes.json();
        setPrecio(data.precio);
      }
    } catch {}
  };

  useEffect(() => { fetchPagos(); }, []);

  const handleCreatePago = async () => {
    if (!nuevoPago.clienteId || !nuevoPago.monto) return;
    try {
      const res = await fetch("/api/entrenador/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: parseInt(nuevoPago.clienteId),
          monto: parseFloat(nuevoPago.monto),
          metodoPago: nuevoPago.metodoPago,
          notas: nuevoPago.notas,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNuevoPago({ clienteId: "", monto: "", metodoPago: "EFECTIVO", notas: "" });
        fetchPagos();
      }
    } catch {}
  };

  const handleDeletePago = async (id: number) => {
    if (!confirm("¿Eliminar este pago?")) return;
    await fetch(`/api/entrenador/pagos?id=${id}`, { method: "DELETE" });
    fetchPagos();
  };

  const handleSavePrecio = async () => {
    const val = parseFloat(nuevoPrecio);
    if (isNaN(val) || val < 0) return;
    const res = await fetch("/api/entrenador/precios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precio: val }),
    });
    if (res.ok) {
      const data = await res.json();
      setPrecio(data.precio);
      setShowConfigModal(false);
    }
  };

  return (
    <div className="min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Mis Pagos</p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
          Gestión de <span className="text-outline">Pagos</span>
        </h1>
        <p className="text-slate-400 text-base max-w-2xl">Registra los pagos que recibes de tus clientes.</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 flex items-center gap-2 rounded-xl">
          <Plus size={16} /> Registrar Pago
        </button>
        <button onClick={() => { setNuevoPrecio(precio.toString()); setShowConfigModal(true); }} className="px-5 py-2.5 border border-white/10 hover:border-[#02F5D4]/50 text-white/70 hover:text-white text-sm transition-all flex items-center gap-2">
          <Settings size={16} /> Precio: {precio} CUP/mes
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#02F5D4]/10 rounded"><DollarSign size={18} className="text-[#02F5D4]" /></div>
                <span className="text-white/50 text-xs uppercase tracking-wider">Total General</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total.monto.toFixed(2)} CUP</p>
              <p className="text-xs text-white/40 mt-1">{stats.total.count} pagos</p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded"><Calendar size={18} className="text-blue-400" /></div>
                <span className="text-white/50 text-xs uppercase tracking-wider">Este Mes</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.esteMes.monto.toFixed(2)} CUP</p>
              <p className="text-xs text-white/40 mt-1">{stats.esteMes.count} pagos</p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded"><TrendingUp size={18} className="text-green-400" /></div>
                <span className="text-white/50 text-xs uppercase tracking-wider">Esta Semana</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.estaSemana.monto.toFixed(2)} CUP</p>
              <p className="text-xs text-white/40 mt-1">{stats.estaSemana.count} pagos</p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded"><Users size={18} className="text-purple-400" /></div>
                <span className="text-white/50 text-xs uppercase tracking-wider">Clientes</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.clientesUnicos.length}</p>
              <p className="text-xs text-white/40 mt-1">clientes atendidos</p>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/50 text-xs uppercase tracking-wider p-4">Cliente</th>
                <th className="text-left text-white/50 text-xs uppercase tracking-wider p-4">Monto</th>
                <th className="text-left text-white/50 text-xs uppercase tracking-wider p-4">Método</th>
                <th className="text-left text-white/50 text-xs uppercase tracking-wider p-4">Fecha</th>
                <th className="text-left text-white/50 text-xs uppercase tracking-wider p-4">Notas</th>
                <th className="text-right text-white/50 text-xs uppercase tracking-wider p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white">{pago.cliente.nombre}</td>
                  <td className="p-4 text-white font-mono">{pago.monto.toFixed(2)} {pago.moneda}</td>
                  <td className="p-4 text-white/60">{pago.metodoPago}</td>
                  <td className="p-4 text-white/60">{new Date(pago.fechaPago).toLocaleDateString()}</td>
                  <td className="p-4 text-white/40 text-sm">{pago.notas || "-"}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeletePago(pago.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-white/30">No hay pagos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Registrar Pago</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Cliente</label>
                  <select value={nuevoPago.clienteId} onChange={(e) => setNuevoPago({ ...nuevoPago, clienteId: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]">
                    <option value="" className="bg-[#050505]">Seleccionar</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#050505]">{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Monto (CUP)</label>
                  <input type="number" step="0.01" value={nuevoPago.monto} onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Método de Pago</label>
                  <select value={nuevoPago.metodoPago} onChange={(e) => setNuevoPago({ ...nuevoPago, metodoPago: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]">
                    <option value="EFECTIVO" className="bg-[#050505]">Efectivo</option>
                    <option value="TRANSFERENCIA" className="bg-[#050505]">Transferencia</option>
                    <option value="ZELLE" className="bg-[#050505]">Zelle</option>
                    <option value="USDT" className="bg-[#050505]">USDT</option>
                    <option value="OTRO" className="bg-[#050505]">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Notas (opcional)</label>
                  <input type="text" value={nuevoPago.notas} onChange={(e) => setNuevoPago({ ...nuevoPago, notas: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all duration-300 rounded-xl">Cancelar</button>
                <button onClick={handleCreatePago} className="flex-1 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 rounded-xl">Guardar</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Configurar Precio Mensual</h3>
              <p className="text-white/40 text-sm mb-4">Define el precio que cobras a tus clientes por mes.</p>
              <input type="number" step="0.01" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#02F5D4]" placeholder="0.00" />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowConfigModal(false)} className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all duration-300 rounded-xl">Cancelar</button>
                <button onClick={handleSavePrecio} className="flex-1 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 rounded-xl">Guardar</button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
