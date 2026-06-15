"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, MessageCircle, Users, HelpCircle, X, AlertTriangle, Check, CreditCard } from "lucide-react";
import { ClientType } from "@/types/client";

interface MembershipsTabProps {
  searchMemberships: string;
  setSearchMemberships: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  membershipsPage: number;
  setMembershipsPage: (value: number | ((prev: number) => number)) => void;
  membershipsPerPage: number;
  setMembershipsPerPage: (value: number) => void;
  membershipsFilterType: string;
  setMembershipsFilterType: (value: string) => void;
  membershipsFilterStatus: string;
  setMembershipsFilterStatus: (value: string) => void;
  membershipsViewMode: "cards" | "list";
  setMembershipsViewMode: (value: "cards" | "list") => void;
  clientesProximosPagos: ClientType[];
  paginatedMemberships: ClientType[];
  totalMembershipPages: number;
  sortedMembershipsLength: number;
  selectedMembership: {
    [key: number]: {
      tipo: string;
      isAdvanced: boolean;
      countDaysWithoutPayment: boolean;
    };
  };
  setSelectedMembership: React.Dispatch<
    React.SetStateAction<{
      [key: number]: {
        tipo: string;
        isAdvanced: boolean;
        countDaysWithoutPayment: boolean;
      };
    }>
  >;
  handleMembershipChange: (
    clientId: number,
    newMembershipType: string,
    isAdvanced: boolean,
    countDaysWithoutPayment: boolean
  ) => Promise<void>;
  formatDate: (dateString: string) => string;
  calculateDaysUntilPayment: (fechaFin: string) => number;
  selectedClientDetail: ClientType | null;
  setSelectedClientDetail: (client: ClientType | null) => void;
}

interface ConfirmModalData {
  clientId: number;
  clientName: string;
  currentMembership: string;
  newMembership: string;
  currentExpiry: string;
  newExpiry: string;
  isAdvanced: boolean;
  countDaysWithoutPayment: boolean;
}

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onClick={() => setShow(!show)}
        onBlur={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black border border-white/20 rounded-lg text-white text-xs w-48 z-50 shadow-xl whitespace-normal">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
}

export default function MembershipsTab({
  searchMemberships,
  setSearchMemberships,
  sortBy,
  setSortBy,
  membershipsPage,
  setMembershipsPage,
  membershipsPerPage,
  setMembershipsPerPage,
  membershipsFilterType,
  setMembershipsFilterType,
  membershipsFilterStatus,
  setMembershipsFilterStatus,
  membershipsViewMode,
  setMembershipsViewMode,
  clientesProximosPagos,
  paginatedMemberships,
  totalMembershipPages,
  sortedMembershipsLength,
  selectedMembership,
  setSelectedMembership,
  handleMembershipChange,
  formatDate,
  calculateDaysUntilPayment,
  selectedClientDetail,
  setSelectedClientDetail,
}: MembershipsTabProps) {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData | null>(null);

  const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
      case "ANUAL": return 365;
      case "TRIMESTRAL": return 180;
      case "MENSUAL": return 30;
      default: return 30;
    }
  };

  const calculateNewExpiry = (currentExpiry: string, newMembershipType: string, isAdvanced: boolean, countDaysWithoutPayment: boolean): string => {
    const hoy = new Date();
    const currentDate = new Date(currentExpiry);
    let startDate: Date;
    if (isAdvanced) {
      startDate = hoy;
    } else {
      startDate = currentDate > hoy ? currentDate : hoy;
    }
    const daysToAdd = getAdditionalDays(newMembershipType);
    const newDate = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return formatDate(newDate.toISOString());
  };

  const handleConfirmMembershipChange = async () => {
    if (!confirmModal) return;
    await handleMembershipChange(
      confirmModal.clientId,
      confirmModal.newMembership,
      confirmModal.isAdvanced,
      confirmModal.countDaysWithoutPayment
    );
    setConfirmModal(null);
  };

  const openConfirmModal = (client: ClientType, newMembershipType: string) => {
    if (!newMembershipType) return;
    const isAdvanced = true;
    const countDaysWithoutPayment = selectedMembership[client.id]?.countDaysWithoutPayment || false;
    let newExpiry: string;
    let currentExpiry = "-";
    let currentMembership = "Sin membresía";

    if (client.membresiaActual) {
      currentExpiry = formatDate(client.membresiaActual.fechaFin);
      currentMembership = client.membresiaActual.tipo;
      newExpiry = calculateNewExpiry(client.membresiaActual.fechaFin, newMembershipType, isAdvanced, countDaysWithoutPayment);
    } else {
      newExpiry = calculateNewExpiryForNew(newMembershipType, countDaysWithoutPayment);
    }

    setConfirmModal({
      clientId: client.id,
      clientName: client.nombre,
      currentMembership,
      newMembership: newMembershipType,
      currentExpiry,
      newExpiry,
      isAdvanced,
      countDaysWithoutPayment
    });
  };

  const calculateNewExpiryForNew = (newMembershipType: string, countDaysWithoutPayment: boolean): string => {
    const hoy = new Date();
    const daysToAdd = getAdditionalDays(newMembershipType);
    const finalDays = countDaysWithoutPayment ? daysToAdd : daysToAdd;
    const newDate = new Date(hoy.getTime() + finalDays * 24 * 60 * 60 * 1000);
    return formatDate(newDate.toISOString());
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#02F5D4] to-[#2272FF] animate-pulse" />
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em]">Membresías</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Control de <span className="text-outline">Acceso</span>
        </h1>
        <p className="text-white/30 text-lg max-w-2xl">
          Gestión de membresías y renovaciones.
        </p>
      </motion.div>

      {clientesProximosPagos.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertTriangle size={14} className="text-yellow-400" />
              </div>
              <p className="text-yellow-400 text-xs uppercase tracking-[0.2em]">Alertas</p>
            </div>
            <h3 className="text-white text-2xl font-bold">Próximos a Pagar</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <AnimatePresence>
              {clientesProximosPagos.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-64 relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-5 hover:border-yellow-500/30 transition-all duration-500 rounded-xl group"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-md opacity-30" />
                      <div className="w-12 h-12 overflow-hidden border border-white/[0.08] rounded-full relative">
                        {client.foto ? (
                          <Image src={client.foto} alt={client.nombre} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                            <Users size={20} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm truncate">{client.nombre}</p>
                      <p className="text-white/20 text-xs font-mono">ID: {client.id}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white/30">Próximo Pago</span>
                      <span className="text-white/60">{formatDate(client.membresiaActual?.fechaFin || "")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/30">Días restantes</span>
                      <span className="text-yellow-400 font-bold font-mono">{client.diasParaPagar}</span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${client.telefono}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-[#02F5D4]/10 to-[#2272FF]/10 hover:from-[#02F5D4]/20 hover:to-[#2272FF]/20 text-[#02F5D4] text-xs font-medium rounded-lg border border-[#02F5D4]/20 hover:border-[#02F5D4]/40 transition-all duration-300"
                  >
                    <MessageCircle size={14} className="mr-1" />
                    Contactar
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchMemberships}
            onChange={(e) => {
              setSearchMemberships(e.target.value);
              setMembershipsPage(1);
            }}
            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 focus:shadow-[0_0_20px_-8px_rgba(2,245,212,0.15)] pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <select
            value={membershipsFilterType}
            onChange={(e) => { setMembershipsFilterType(e.target.value); setMembershipsPage(1); }}
            className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2 text-xs text-white focus:outline-none transition-all rounded-xl"
          >
            <option value="all" className="bg-[#0a0a0a]">Tipo</option>
            <option value="MENSUAL" className="bg-[#0a0a0a]">Mensual</option>
            <option value="TRIMESTRAL" className="bg-[#0a0a0a]">Trimestral</option>
            <option value="ANUAL" className="bg-[#0a0a0a]">Anual</option>
          </select>
          <select
            value={membershipsFilterStatus}
            onChange={(e) => { setMembershipsFilterStatus(e.target.value); setMembershipsPage(1); }}
            className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2 text-xs text-white focus:outline-none transition-all rounded-xl"
          >
            <option value="all" className="bg-[#0a0a0a]">Estado</option>
            <option value="active" className="bg-[#0a0a0a]">Activa</option>
            <option value="expired" className="bg-[#0a0a0a]">Vencida</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setMembershipsPage(1); }}
            className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2 text-xs text-white focus:outline-none transition-all rounded-xl"
          >
            <option value="nombreAsc" className="bg-[#0a0a0a]">Orden</option>
            <option value="nombreDesc" className="bg-[#0a0a0a]">Nombre ↓</option>
            <option value="membresiaActual.fechaFinAsc" className="bg-[#0a0a0a]">Vence ↑</option>
            <option value="membresiaActual.fechaFinDesc" className="bg-[#0a0a0a]">Vence ↓</option>
            <option value="diasParaPagarAsc" className="bg-[#0a0a0a]">Días ↑</option>
            <option value="diasParaPagarDesc" className="bg-[#0a0a0a]">Días ↓</option>
          </select>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setMembershipsViewMode("cards")}
              className={`p-2.5 border transition-all rounded-xl ${
                membershipsViewMode === "cards"
                  ? "border-[#02F5D4]/40 text-[#02F5D4] bg-[#02F5D4]/5"
                  : "border-white/[0.08] text-white/30 hover:border-white/20 hover:text-white/50"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setMembershipsViewMode("list")}
              className={`p-2.5 border transition-all rounded-xl ${
                membershipsViewMode === "list"
                  ? "border-[#02F5D4]/40 text-[#02F5D4] bg-[#02F5D4]/5"
                  : "border-white/[0.08] text-white/30 hover:border-white/20 hover:text-white/50"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p className="text-white/20 text-sm mb-6">
        Mostrando {Math.min((membershipsPage - 1) * membershipsPerPage + 1, sortedMembershipsLength)} -{" "}
        {Math.min(membershipsPage * membershipsPerPage, sortedMembershipsLength)} de {sortedMembershipsLength} resultados
      </p>

      {membershipsViewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {paginatedMemberships.map((client, index) => {
              const dias = client.membresiaActual
                ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
                : null;
              const tipo = client.membresiaActual?.tipo || "";
              let tipoBadge = "bg-white/10 text-white/60";
              if (tipo === "MENSUAL") tipoBadge = "badge-premium-blue";
              if (tipo === "TRIMESTRAL") tipoBadge = "badge-premium-cyan";
              if (tipo === "ANUAL") tipoBadge = "badge-premium-yellow";
              const vencido = dias !== null && dias < 0;
              return (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="group"
                >
                  <div className="relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(2,245,212,0.08)] transition-all duration-500 rounded-xl">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-4 mb-4 cursor-pointer" onClick={() => setSelectedClientDetail(client)}>
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/20 to-[#2272FF]/20 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-14 h-14 overflow-hidden border-2 border-white/[0.08] group-hover:border-[#02F5D4]/30 transition-colors rounded-full relative">
                          {client.foto ? (
                            <Image src={client.foto} alt={client.nombre} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                              <Users size={22} className="text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-[#0a0a0a] flex items-center justify-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${vencido ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"}`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-lg truncate">{client.nombre}</h3>
                          <span className={`shrink-0 ${tipoBadge}`}>{tipo || "Sin"}</span>
                        </div>
                        <p className="text-white/20 text-xs font-mono mt-1">ID: {client.id}</p>
                      </div>
                    </div>
                    <div className="space-y-2.5 mb-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Último Pago</span>
                        <span className="text-white/60">
                          {client.membresiaActual ? formatDate(client.membresiaActual.fechaInicio) : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Próximo Pago</span>
                        <span className="text-white/60">
                          {client.membresiaActual ? formatDate(client.membresiaActual.fechaFin) : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Días restantes</span>
                        {vencido ? (
                          <span className="text-red-400 font-bold font-mono text-xs">{dias} (Vencido)</span>
                        ) : (
                          <span className="text-white/60">{dias !== null ? dias : "-"}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Estado</span>
                        <span className={`${client.membresiaActual?.estadoPago === 'PAGADO' ? 'text-emerald-400' : 'text-yellow-400'} text-xs font-medium`}>{client.membresiaActual?.estadoPago || "Sin pago"}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/[0.06] space-y-3">
                      <select
                        value={selectedMembership[client.id]?.tipo || ""}
                        onChange={(e) => {
                          openConfirmModal(client, e.target.value);
                        }}
                        className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2.5 text-white text-sm focus:outline-none transition-all rounded-xl"
                      >
                        <option value="" disabled className="bg-[#0a0a0a]">Seleccionar membresía</option>
                        <option value="MENSUAL" className="bg-[#0a0a0a]">Mensual</option>
                        <option value="TRIMESTRAL" className="bg-[#0a0a0a]">Trimestral</option>
                        <option value="ANUAL" className="bg-[#0a0a0a]">Anual</option>
                      </select>
                      <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-2 text-white/40 hover:text-white/60 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMembership[client.id]?.isAdvanced || false}
                            onChange={(e) => {
                              setSelectedMembership((prev) => ({
                                ...prev,
                                [client.id]: {
                                  ...prev[client.id],
                                  isAdvanced: e.target.checked,
                                },
                              }));
                            }}
                            className="accent-[#02F5D4] w-3.5 h-3.5"
                          />
                          Adelantar
                        </label>
                        <Tooltip content="Si está marcada, la membresía comienza a contar desde HOY en lugar de desde que termina la actual. Useful cuando el cliente quiere empezar a usar la membresía inmediatamente.">
                          <HelpCircle size={14} className="text-white/20 cursor-help hover:text-white/40 transition-colors" />
                        </Tooltip>
                        <label className="flex items-center gap-2 text-white/40 hover:text-white/60 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMembership[client.id]?.countDaysWithoutPayment || false}
                            onChange={(e) => {
                              setSelectedMembership((prev) => ({
                                ...prev,
                                [client.id]: {
                                  ...prev[client.id],
                                  countDaysWithoutPayment: e.target.checked,
                                },
                              }));
                            }}
                            className="accent-[#02F5D4] w-3.5 h-3.5"
                          />
                          Contar días
                        </label>
                        <Tooltip content="Si la membresía está vencida, esta opción descuenta los días sin pago del período nuevo. Por ejemplo: si pasaron 5 días vencidos, la nueva membresía será 5 días más corta.">
                          <HelpCircle size={14} className="text-white/20 cursor-help hover:text-white/40 transition-colors" />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {paginatedMemberships.map((client, index) => {
              const dias = client.membresiaActual
                ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
                : null;
              const tipo = client.membresiaActual?.tipo || "";
              let tipoBadge = "bg-white/10 text-white/60";
              if (tipo === "MENSUAL") tipoBadge = "badge-premium-blue";
              if (tipo === "TRIMESTRAL") tipoBadge = "badge-premium-cyan";
              if (tipo === "ANUAL") tipoBadge = "badge-premium-yellow";
              const vencido = dias !== null && dias < 0;
              return (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="group"
                >
                  <div className="flex items-center gap-4 p-4 border border-white/[0.04] hover:border-[#02F5D4]/20 bg-gradient-to-r from-white/[0.01] to-transparent hover:from-white/[0.02] transition-all rounded-xl cursor-pointer" onClick={() => setSelectedClientDetail(client)}>
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/10 to-[#2272FF]/10 rounded-full blur-md opacity-30" />
                      <div className="w-12 h-12 overflow-hidden border border-white/[0.08] rounded-full relative">
                        {client.foto ? (
                          <Image src={client.foto} alt={client.nombre} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                            <Users size={20} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 md:col-span-3">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold truncate">{client.nombre}</p>
                          <span className={`shrink-0 ${tipoBadge}`}>{tipo || "-"}</span>
                        </div>
                        <p className="text-white/20 text-xs font-mono mt-1">ID: {client.id}</p>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Últ. Pago</p>
                        <p className="text-white/50 text-xs">
                          {client.membresiaActual ? formatDate(client.membresiaActual.fechaInicio) : "-"}
                        </p>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Próx. Pago</p>
                        <p className="text-white/50 text-xs">
                          {client.membresiaActual ? formatDate(client.membresiaActual.fechaFin) : "-"}
                        </p>
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Días</p>
                        <p className={`font-mono text-sm font-bold ${vencido ? "text-red-400" : "text-white/50"}`}>
                          {dias !== null ? dias : "-"}
                        </p>
                      </div>
                      <div className="col-span-12 md:col-span-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={selectedMembership[client.id]?.tipo || ""}
                          onChange={(e) => {
                            openConfirmModal(client, e.target.value);
                          }}
                          className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-2 py-1.5 text-white text-xs focus:outline-none transition-all rounded-lg"
                        >
                          <option value="" disabled className="bg-[#0a0a0a]">Membresía</option>
                          <option value="MENSUAL" className="bg-[#0a0a0a]">Mensual</option>
                          <option value="TRIMESTRAL" className="bg-[#0a0a0a]">Trimestral</option>
                          <option value="ANUAL" className="bg-[#0a0a0a]">Anual</option>
                        </select>
                        <Tooltip content="Nueva membresía empieza desde hoy">
                          <label className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedMembership[client.id]?.isAdvanced || false}
                              onChange={(e) => {
                                setSelectedMembership((prev) => ({
                                  ...prev,
                                  [client.id]: {
                                    ...prev[client.id],
                                    isAdvanced: e.target.checked,
                                  },
                                }));
                              }}
                              className="accent-[#02F5D4] w-3 h-3"
                            />
                            Adel.
                          </label>
                        </Tooltip>
                        <Tooltip content="Descuenta días vencidos del período">
                          <label className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedMembership[client.id]?.countDaysWithoutPayment || false}
                              onChange={(e) => {
                                setSelectedMembership((prev) => ({
                                  ...prev,
                                  [client.id]: {
                                    ...prev[client.id],
                                    countDaysWithoutPayment: e.target.checked,
                                  },
                                }));
                              }}
                              className="accent-[#02F5D4] w-3 h-3"
                            />
                            Contar
                          </label>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {totalMembershipPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <span className="text-white/20 text-sm font-mono">
            Página {membershipsPage} de {totalMembershipPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMembershipsPage((p: number) => Math.max(1, p - 1))}
              disabled={membershipsPage === 1}
              className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-xl border border-white/[0.06] hover:border-white/[0.12] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalMembershipPages) }, (_, i) => {
              const start = Math.max(1, Math.min(membershipsPage - 2, totalMembershipPages - 4));
              const pageNum = start + i;
              if (pageNum > totalMembershipPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setMembershipsPage(pageNum)}
                  className={`w-9 h-9 text-sm font-bold transition-all rounded-xl ${
                    membershipsPage === pageNum
                      ? "bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white shadow-[0_0_12px_-4px_rgba(2,245,212,0.3)]"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white/80 border border-white/[0.06]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setMembershipsPage((p: number) => Math.min(totalMembershipPages, p + 1))}
              disabled={membershipsPage === totalMembershipPages}
              className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-xl border border-white/[0.06] hover:border-white/[0.12] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] w-full max-w-md rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] p-6"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Confirmar Cambio</h3>
                  <p className="text-white/30 text-sm">¿Actualizar membresía de {confirmModal.clientName}?</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/[0.03] border border-white/[0.06] p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/30 text-xs uppercase tracking-wider">Membresía actual</span>
                    <span className="text-white font-medium">{confirmModal.currentMembership}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/30 text-xs uppercase tracking-wider">Nueva membresía</span>
                    <span className="text-[#02F5D4] font-bold">{confirmModal.newMembership}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center">
                    <span className="text-white/30 text-xs uppercase tracking-wider">Vence actualmente</span>
                    <span className="text-white/70">{confirmModal.currentExpiry}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/30 text-xs uppercase tracking-wider">Se vencerá</span>
                    <span className="text-white font-medium">{confirmModal.newExpiry}</span>
                  </div>
                  {(confirmModal.isAdvanced || confirmModal.countDaysWithoutPayment) && (
                    <div className="border-t border-white/[0.06] pt-3">
                      <p className="text-yellow-400 text-xs font-medium mb-2">Opciones especiales aplicadas:</p>
                      <div className="space-y-1">
                        {confirmModal.isAdvanced && <div className="flex items-center gap-2 text-white/40 text-xs"><Check size={12} className="text-yellow-400" /> Adelantar: Empezará desde hoy</div>}
                        {confirmModal.countDaysWithoutPayment && <div className="flex items-center gap-2 text-white/40 text-xs"><Check size={12} className="text-yellow-400" /> Contar días: Se descontarán días vencidos</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 px-4 py-3 border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 transition-all rounded-xl text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmMembershipChange}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_16px_-4px_rgba(2,245,212,0.3)]"
                >
                  <Check size={18} />
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedClientDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClientDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#02F5D4]/20 to-transparent" />
              <div className="sticky top-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] backdrop-blur-2xl border-b border-white/[0.06] p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Cliente</p>
                  <h3 className="text-white font-bold text-2xl">{selectedClientDetail.nombre}</h3>
                </div>
                <button
                  onClick={() => setSelectedClientDetail(null)}
                  className="p-2.5 rounded-xl hover:bg-white/10 transition-colors border border-white/[0.06]"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/20 to-[#2272FF]/20 rounded-full blur-xl opacity-30" />
                    <div className="w-20 h-20 overflow-hidden border-2 border-white/[0.08] rounded-full relative">
                      {selectedClientDetail.foto ? (
                        <Image src={selectedClientDetail.foto} alt={selectedClientDetail.nombre} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                          <Users size={32} className="text-white/20" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-white/20 text-xs uppercase tracking-wider mb-1">ID</p>
                      <p className="text-white font-mono font-medium">{selectedClientDetail.id}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                      <p className="text-white">{selectedClientDetail.telefono}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Sexo</p>
                      <p className="text-white/70">{selectedClientDetail.sexo || "-"}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Email</p>
                      <p className="text-white/70 text-xs truncate">{selectedClientDetail.email || "-"}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Instagram</p>
                      <p className="text-white/70 text-xs">{selectedClientDetail.instagram || "-"}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Entrenador</p>
                      <p className="text-white/70 text-xs">{selectedClientDetail.entrenadorAsignado?.nombre || "Sin asignar"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#02F5D4] to-[#2272FF]" />
                    <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Historial de Pagos</p>
                  </div>
                  {selectedClientDetail.membresias && selectedClientDetail.membresias.length > 0 ? (
                    <div className="space-y-2">
                      {selectedClientDetail.membresias
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((membresia, index) => (
                          <div key={membresia.id || index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all">
                            <div>
                              <p className="text-white font-medium text-sm">{membresia.tipo}</p>
                              <p className="text-white/30 text-xs">
                                {formatDate(membresia.fechaInicio)} - {formatDate(membresia.fechaFin)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`${membresia.estadoPago === "PAGADO" ? "badge-premium-green" : membresia.estadoPago === "PENDIENTE" ? "badge-premium-yellow" : "badge-premium-red"}`}>
                                {membresia.estadoPago}
                              </span>
                              <p className="text-white/20 text-xs mt-1 font-mono">{formatDate(membresia.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard size={24} className="text-white/10 mx-auto mb-2" />
                      <p className="text-white/20 text-sm">Sin historial de pagos</p>
                    </div>
                  )}
                </div>

                {selectedClientDetail.membresiaActual && (
                  <div className="border-t border-white/[0.06] pt-8 mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#2272FF] to-[#02F5D4]" />
                      <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]">Membresía Actual</p>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#02F5D4]/5 to-[#2272FF]/5 border border-[#02F5D4]/20 rounded-xl">
                      <div>
                        <p className="text-white font-bold text-lg">{selectedClientDetail.membresiaActual.tipo}</p>
                        <p className="text-white/40 text-xs mt-1">
                          Expira: {formatDate(selectedClientDetail.membresiaActual.fechaFin)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={calculateDaysUntilPayment(selectedClientDetail.membresiaActual.fechaFin) >= 0 ? "badge-premium-green" : "badge-premium-red"}>
                          {calculateDaysUntilPayment(selectedClientDetail.membresiaActual.fechaFin) >= 0 ? "Activa" : "Vencida"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
