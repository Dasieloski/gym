"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Bell, Phone, Calendar, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface Recordatorio {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteTelefono: string;
  clienteFoto: string | null;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  estado: "VENCIDA" | "CRITICO" | "PRONTO";
}

export default function RecordatoriosTab() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState(5);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRecordatorios = async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recordatorios?dias=${d}`);
      if (res.ok) {
        const data = await res.json();
        setRecordatorios(data.recordatorios || []);
      }
    } catch (error) {
      console.error("Error fetching recordatorios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordatorios(dias);
  }, [dias]);

  const totalPages = Math.max(1, Math.ceil(recordatorios.length / itemsPerPage));
  const paginated = recordatorios.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "CRITICO":
        return { color: "text-red-400 bg-red-500/10", label: "Vence hoy/mañana" };
      case "VENCIDA":
        return { color: "text-yellow-400 bg-yellow-500/10", label: "Vencida" };
      default:
        return { color: "text-emerald-400 bg-emerald-500/10", label: "Pronto" };
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "MENSUAL": return "Mensual";
      case "TRIMESTRAL": return "Trimestral";
      case "ANUAL": return "Anual";
      default: return tipo;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Fase 2</p>
        <h2 className="text-white font-bold text-3xl">Recordatorios de Pago</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Por vencer</p>
          <p className="text-white text-3xl font-bold font-mono">
            {recordatorios.filter((r) => r.estado === "PRONTO").length}
          </p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Críticos</p>
          <p className="text-red-400 text-3xl font-bold font-mono">
            {recordatorios.filter((r) => r.estado === "CRITICO").length}
          </p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Vencidas</p>
          <p className="text-yellow-400 text-3xl font-bold font-mono">
            {recordatorios.filter((r) => r.estado === "VENCIDA").length}
          </p>
        </div>
        <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Ventana (días)</p>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setDias(Math.max(1, dias - 1))}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-xs transition-colors"
            >
              -
            </button>
            <span className="text-white text-xl font-bold font-mono">{dias}</span>
            <button
              onClick={() => setDias(Math.min(30, dias + 1))}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-xs transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#02F5D4]/20 border-t-[#02F5D4] rounded-full animate-spin" />
        </div>
      ) : recordatorios.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No hay membresías por vencer en los próximos {dias} días</p>
        </div>
      ) : (
        <>
          <div className="border border-white/10 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/[0.02] border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
              <div className="col-span-3">Cliente</div>
              <div className="col-span-2">Membresía</div>
              <div className="col-span-2">Vence</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-3">Acción</div>
            </div>

            <AnimatePresence mode="popLayout">
              {paginated.map((r, index) => {
                const badge = getEstadoBadge(r.estado);
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors items-center"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden border border-white/10 shrink-0">
                        {r.clienteFoto ? (
                          <Image src={r.clienteFoto} alt={r.clienteNombre} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                            <Bell size={16} className="text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{r.clienteNombre}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider md:hidden mb-1">Membresía</p>
                      <span className="text-slate-300 text-sm">{getTipoLabel(r.tipo)}</span>
                    </div>

                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider md:hidden mb-1">Vence</p>
                      <p className="text-slate-300 text-sm font-mono">
                        {new Date(r.fechaFin).toLocaleDateString("es-ES")}
                      </p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">
                        {r.diasRestantes > 0 ? `${r.diasRestantes} días` : r.diasRestantes === 0 ? "Hoy" : "Vencida"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider md:hidden mb-1">Estado</p>
                      <span className={`inline-block px-2 py-1 text-xs font-mono uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="col-span-3 flex gap-2">
                      {r.clienteTelefono && (
                        <a
                          href={`https://wa.me/${r.clienteTelefono.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                        >
                          <Phone size={14} />
                          WhatsApp
                        </a>
                      )}
                      <a
                        href={`tel:${r.clienteTelefono}`}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 text-white transition-colors"
                      >
                        <Phone size={14} />
                        Llamar
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <span className="text-slate-400 text-sm">
                Página {page} de {totalPages} ({recordatorios.length} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const pageNum = start + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 text-sm font-medium transition-colors ${
                        page === pageNum ? "bg-[#02F5D4] text-black" : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => { setPage(1); fetchRecordatorios(dias); }}
              className="flex items-center gap-2 px-4 py-2 text-xs bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
