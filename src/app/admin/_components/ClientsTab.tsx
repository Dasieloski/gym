"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, Edit, Trash, X, Users, Eye, History as HistoryIcon, Key, ZoomIn, QrCode, Download } from "lucide-react";
import { ClientType } from "@/types/client";
import ImageModal from "@/components/ImageModal";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => ({ default: m.QRCodeSVG })), { ssr: false });

const traducirComoConocio = (valor?: string): string => {
  const mapa: Record<string, string> = {
    "REFERIDO": "Referido",
    "REDES_SOCIALES": "Redes Sociales",
    "PASO_PUERTA": "Pasó por la puerta",
    "OTRO": "Otro",
  };
  return valor ? mapa[valor] || valor : "-";
};

interface ClientsTabProps {
  searchClients: string;
  setSearchClients: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  clientsPage: number;
  setClientsPage: (value: number | ((prev: number) => number)) => void;
  clientsPerPage: number;
  setClientsPerPage: (value: number) => void;
  clientsFilterMembership: string;
  setClientsFilterMembership: (value: string) => void;
  clientsFilterTrainer: string;
  setClientsFilterTrainer: (value: string) => void;
  clientsViewMode: "cards" | "list";
  setClientsViewMode: (value: "cards" | "list") => void;
  trainers: { id: number; nombre: string }[];
  paginatedClients: ClientType[];
  totalClientPages: number;
  sortedClientsLength: number;
  sortedClients: ClientType[];
  editingClient: {
    id: number;
    nombre: string;
    telefono: string;
    entrenadorAsignadoId: string | null;
    rol: string;
  } | null;
  setEditingClient: React.Dispatch<
    React.SetStateAction<{
      id: number;
      nombre: string;
      telefono: string;
      entrenadorAsignadoId: string | null;
      rol: string;
    } | null>
  >;
  handleEditClient: (
    client: {
      id: number;
      nombre: string;
      telefono: string;
      entrenadorAsignadoId: string | null;
      rol: string;
    } | null
  ) => void;
  handleSaveClient: (password?: string) => Promise<void>;
  handleDelete: (id: number | null, type: string) => void;
  calculateDaysUntilPayment: (fechaFin: string) => number;
  entrenadoresList: ClientType[];
  otrosList: ClientType[];
}

export default function ClientsTab({
  searchClients,
  setSearchClients,
  sortBy,
  setSortBy,
  clientsPage,
  setClientsPage,
  clientsPerPage,
  setClientsPerPage,
  clientsFilterMembership,
  setClientsFilterMembership,
  clientsFilterTrainer,
  setClientsFilterTrainer,
  clientsViewMode,
  setClientsViewMode,
  trainers,
  paginatedClients,
  totalClientPages,
  sortedClientsLength,
  sortedClients,
  editingClient,
  setEditingClient,
  handleEditClient,
  handleSaveClient,
  handleDelete,
  calculateDaysUntilPayment,
  entrenadoresList,
  otrosList,
}: ClientsTabProps) {
  const [localSearch, setLocalSearch] = useState(searchClients);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<ClientType | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [qrClient, setQrClient] = useState<{ id: number; nombre: string } | null>(null);

  const exportCSV = () => {
    if (sortedClients.length === 0) return;
    const headers = ["ID", "Nombre", "Carnet", "Teléfono", "Rol", "Membresía", "Estado", "Vence", "Entrenador", "Cómo nos conoció"];
    const rows = sortedClients.map(c => [
      c.id,
      c.nombre,
      c.carnetIdentidad,
      c.telefono,
      c.rol,
      c.membresiaActual?.tipo || "Sin",
      c.membresiaActual?.estadoPago || "-",
      c.membresiaActual?.fechaFin ? new Date(c.membresiaActual.fechaFin).toLocaleDateString("es-ES") : "-",
      c.entrenadorAsignado?.nombre || "Sin",
      traducirComoConocio(c.comoConocio),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleViewHistory = (client: ClientType) => {
    setSelectedClientHistory(client);
  };

  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
  };

  const handleSaveWithPassword = async () => {
    await handleSaveClient(newPassword);
    setNewPassword("");
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "2-digit" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
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
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em]">Clientes</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Base de <span className="text-outline">Datos</span>
        </h1>
        <p className="text-white/30 text-lg max-w-2xl">
          Gestión completa de clientes activos.
        </p>
      </motion.div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Buscar..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchClients(e.target.value);
                setClientsPage(1);
              }}
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 focus:shadow-[0_0_20px_-8px_rgba(2,245,212,0.15)] pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <select
            value={clientsFilterMembership}
            onChange={(e) => { setClientsFilterMembership(e.target.value); setClientsPage(1); }}
            className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2 text-xs text-white focus:outline-none transition-all rounded-xl"
          >
            <option value="all" className="bg-[#0a0a0a]">Membresías</option>
            <option value="active" className="bg-[#0a0a0a]">Activa</option>
            <option value="expired" className="bg-[#0a0a0a]">Vencida</option>
            <option value="none" className="bg-[#0a0a0a]">Sin</option>
          </select>
          <select
            value={clientsFilterTrainer}
            onChange={(e) => { setClientsFilterTrainer(e.target.value); setClientsPage(1); }}
            className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2 text-xs text-white focus:outline-none transition-all rounded-xl"
          >
            <option value="all" className="bg-[#0a0a0a]">Entrenador</option>
            <option value="none" className="bg-[#0a0a0a]">Sin</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id.toString()} className="bg-[#0a0a0a]">
                {trainer.nombre}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setClientsPage(1); }}
            className="bg-white/[0.03] border border-white/[0.08] focus:border-[#02F5D4]/40 px-3 py-2 text-xs text-white focus:outline-none transition-all rounded-xl"
          >
            <option value="nombre" className="bg-[#0a0a0a]">Nombre</option>
            <option value="id" className="bg-[#0a0a0a]">ID</option>
            <option value="membresiaActual.tipo" className="bg-[#0a0a0a]">Tipo</option>
          </select>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={exportCSV}
              className="p-2.5 border border-white/[0.08] text-white/30 hover:border-[#02F5D4]/40 hover:text-[#02F5D4] hover:bg-[#02F5D4]/5 transition-all rounded-xl"
              title="Exportar CSV"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setClientsViewMode("cards")}
              className={`p-2.5 border transition-all rounded-xl ${
                clientsViewMode === "cards"
                  ? "border-[#02F5D4]/40 text-[#02F5D4] bg-[#02F5D4]/5"
                  : "border-white/[0.08] text-white/30 hover:border-white/20 hover:text-white/50"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setClientsViewMode("list")}
              className={`p-2.5 border transition-all rounded-xl ${
                clientsViewMode === "list"
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
        Mostrando {Math.min((clientsPage - 1) * clientsPerPage + 1, sortedClientsLength)} -{" "}
        {Math.min(clientsPage * clientsPerPage, sortedClientsLength)} de {sortedClientsLength} resultados
      </p>

      {clientsViewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {paginatedClients.map((client, index) => {
              const dias = client.membresiaActual
                ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
                : null;
              const roleStyles: Record<string, string> = {
                ADMIN: "badge-premium-purple",
                ENTRENADOR: "badge-premium-blue",
                CLIENTE: "badge-premium-green",
                CLIENTEESPERA: "badge-premium-yellow",
              };
              const rolColor = roleStyles[client.rol] || "bg-white/10 text-white/60";

              let badgeLabel = "Sin membresía";
              let badgeClass = "badge-premium-red";
              if (dias !== null) {
                if (dias >= 0) {
                  badgeClass = "badge-premium-green";
                  badgeLabel = "Activa";
                } else {
                  badgeClass = "badge-premium-yellow";
                  badgeLabel = "Vencida";
                }
              }
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
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#02F5D4]/20 to-[#2272FF]/20 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div
                          className="w-16 h-16 overflow-hidden border-2 border-white/[0.08] group-hover:border-[#02F5D4]/30 transition-colors cursor-pointer rounded-full relative"
                          onClick={() => client.foto && handleImageClick(client.foto, client.nombre)}
                        >
                          {client.foto ? (
                            <Image src={client.foto} alt={client.nombre} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                              <Users size={24} className="text-white/20" />
                            </div>
                          )}
                          {client.foto && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                              <ZoomIn size={20} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0a0a0a] border-2 border-[#0a0a0a] flex items-center justify-center">
                          <div className={`w-3 h-3 rounded-full ${dias !== null && dias >= 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"}`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-lg truncate">{client.nombre}</h3>
                          <span className={`shrink-0 ${rolColor}`}>
                            {client.rol}
                          </span>
                        </div>
                        <p className="text-white/20 text-xs font-mono mt-1">ID: {client.id}</p>
                        <span className={`mt-2 inline-block ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2.5 mb-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Carnet</span>
                        <span className="text-white/60 font-mono text-xs">{client.carnetIdentidad}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Teléfono</span>
                        <span className="text-white/60">{client.telefono}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Cómo nos conoció</span>
                        <span className="text-white/60 text-xs">{traducirComoConocio(client.comoConocio)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Membresía</span>
                        <span className="text-[#02F5D4] font-medium text-xs">{client.membresiaActual?.tipo || "Sin"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/30 text-xs uppercase tracking-wider">Entrenador</span>
                        <span className="text-white/60 truncate ml-4 text-xs">
                          {client.entrenadorAsignado ? client.entrenadorAsignado.nombre : "Sin entrenador"}
                        </span>
                      </div>
                      {dias !== null && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/30 text-xs uppercase tracking-wider">Días restantes</span>
                          <span className={`font-mono font-bold ${dias >= 0 ? "text-emerald-400" : "text-yellow-400"}`}>
                            {dias}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-white/[0.06] opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        className="flex-1 px-3 py-2.5 text-xs bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
                        onClick={() =>
                          handleEditClient({
                            id: client.id,
                            nombre: client.nombre,
                            telefono: client.telefono,
                            entrenadorAsignadoId: client.entrenadorAsignado?.id?.toString() || null,
                            rol: client.rol,
                          })
                        }
                      >
                        <Edit size={14} className="inline mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => setQrClient({ id: client.id, nombre: client.nombre })}
                        className="px-3 py-2.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all rounded-lg border border-emerald-500/20 hover:border-emerald-500/40"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, "client")}
                        className="px-3 py-2.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all rounded-lg border border-red-500/20 hover:border-red-500/40"
                      >
                        <Trash size={14} />
                      </button>
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
            {paginatedClients.map((client, index) => {
              const dias = client.membresiaActual
                ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
                : null;
              const roleStyles: Record<string, string> = {
                ADMIN: "badge-premium-purple",
                ENTRENADOR: "badge-premium-blue",
                CLIENTE: "badge-premium-green",
                CLIENTEESPERA: "badge-premium-yellow",
              };
              const rolColor = roleStyles[client.rol] || "bg-white/10 text-white/60";

              let badgeClass = "badge-premium-red";
              let badgeLabel = "Sin membresía";
              if (dias !== null) {
                if (dias >= 0) {
                  badgeClass = "badge-premium-green";
                  badgeLabel = "Activa";
                } else {
                  badgeClass = "badge-premium-yellow";
                  badgeLabel = "Vencida";
                }
              }
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
                  <div className="flex items-center gap-4 p-4 border border-white/[0.04] hover:border-[#02F5D4]/20 bg-gradient-to-r from-white/[0.01] to-transparent hover:from-white/[0.02] transition-all rounded-xl">
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
                          <span className={`shrink-0 ${rolColor}`}>
                            {client.rol}
                          </span>
                        </div>
                        <p className="text-white/20 text-xs font-mono mt-1">CI: {client.carnetIdentidad}</p>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Estado</p>
                        <span className={`${badgeClass}`}>
                          {badgeLabel}
                        </span>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Cómo nos conoció</p>
                        <p className="text-white/50 text-sm">{traducirComoConocio(client.comoConocio)}</p>
                      </div>
                      <div className="col-span-12 md:col-span-2">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Entrenador</p>
                        <p className="text-white/50 text-sm truncate">
                          {client.entrenadorAsignado ? client.entrenadorAsignado.nombre : "Sin asignar"}
                        </p>
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <p className="text-white/20 text-xs uppercase tracking-wider mb-1">Días</p>
                        <p className={`font-mono text-sm font-bold ${dias !== null && dias >= 0 ? "text-emerald-400" : dias !== null ? "text-yellow-400" : "text-white/20"}`}>
                          {dias !== null ? dias : "-"}
                        </p>
                      </div>
                      <div className="col-span-6 md:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          className="px-3 py-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
                          onClick={() =>
                            handleEditClient({
                              id: client.id,
                              nombre: client.nombre,
                              telefono: client.telefono,
                              entrenadorAsignadoId: client.entrenadorAsignado?.id?.toString() || null,
                              rol: client.rol,
                            })
                          }
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setQrClient({ id: client.id, nombre: client.nombre })}
                          className="px-3 py-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all rounded-lg border border-emerald-500/20 hover:border-emerald-500/40"
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, "client")}
                          className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all rounded-lg border border-red-500/20 hover:border-red-500/40"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {totalClientPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <span className="text-white/20 text-sm font-mono">
            Página {clientsPage} de {totalClientPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setClientsPage((p: number) => Math.max(1, p - 1))}
              disabled={clientsPage === 1}
              className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-xl border border-white/[0.06] hover:border-white/[0.12] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalClientPages) }, (_, i) => {
              const start = Math.max(1, Math.min(clientsPage - 2, totalClientPages - 4));
              const pageNum = start + i;
              if (pageNum > totalClientPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setClientsPage(pageNum)}
                  className={`w-9 h-9 text-sm font-bold transition-all rounded-xl ${
                    clientsPage === pageNum
                      ? "bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white shadow-[0_0_12px_-4px_rgba(2,245,212,0.3)]"
                      : "bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white/80 border border-white/[0.06]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setClientsPage((p: number) => Math.min(totalClientPages, p + 1))}
              disabled={clientsPage === totalClientPages}
              className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-xl border border-white/[0.06] hover:border-white/[0.12] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ENTRENADORES Section */}
      {entrenadoresList.length > 0 && (
        <>
          <div className="mt-16 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#2272FF] to-[#02F5D4] animate-pulse" />
              <p className="text-[#2272FF] text-xs uppercase tracking-[0.3em]">Personal</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              Entrenadores
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entrenadoresList.map((user) => {
              const roleStyles: Record<string, string> = {
                ADMIN: "badge-premium-purple",
                ENTRENADOR: "badge-premium-blue",
                CLIENTE: "badge-premium-green",
                CLIENTEESPERA: "badge-premium-yellow",
              };
              const rolColor = roleStyles[user.rol] || "bg-white/10 text-white/60";
              return (
                <div key={user.id} className="relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(34,114,255,0.08)] transition-all duration-500 rounded-xl group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2272FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2272FF]/20 to-[#02F5D4]/20 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="w-16 h-16 overflow-hidden border-2 border-white/[0.08] group-hover:border-[#2272FF]/30 transition-colors cursor-pointer rounded-full relative"
                        onClick={() => user.foto && handleImageClick(user.foto, user.nombre)}
                      >
                        {user.foto ? (
                          <Image src={user.foto} alt={user.nombre} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                            <Users size={24} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-lg truncate">{user.nombre}</h3>
                        <span className={`shrink-0 ${rolColor}`}>
                          {user.rol}
                        </span>
                      </div>
                      <p className="text-white/20 text-xs font-mono mt-1">ID: {user.id}</p>
                      <p className="text-white/40 text-sm mt-2">{user.telefono}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-white/[0.06] opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      className="flex-1 px-3 py-2.5 text-xs bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
                      onClick={() =>
                        handleEditClient({
                          id: user.id,
                          nombre: user.nombre,
                          telefono: user.telefono,
                          entrenadorAsignadoId: null,
                          rol: user.rol,
                        })
                      }
                    >
                      <Edit size={14} className="inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, "client")}
                      className="px-3 py-2.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all rounded-lg border border-red-500/20 hover:border-red-500/40"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* OTROS Section */}
      {otrosList.length > 0 && (
        <>
          <div className="mt-16 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
              <p className="text-purple-400 text-xs uppercase tracking-[0.3em]">Administración</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              Otros Roles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otrosList.map((user) => {
              const roleStyles: Record<string, string> = {
                ADMIN: "badge-premium-purple",
                ENTRENADOR: "badge-premium-blue",
                CLIENTE: "badge-premium-green",
                CLIENTEESPERA: "badge-premium-yellow",
              };
              const rolColor = roleStyles[user.rol] || "bg-white/10 text-white/60";
              return (
                <div key={user.id} className="relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01] p-6 hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(168,85,247,0.08)] transition-all duration-500 rounded-xl group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="w-16 h-16 overflow-hidden border-2 border-white/[0.08] group-hover:border-purple-500/30 transition-colors cursor-pointer rounded-full relative"
                        onClick={() => user.foto && handleImageClick(user.foto, user.nombre)}
                      >
                        {user.foto ? (
                          <Image src={user.foto} alt={user.nombre} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
                            <Users size={24} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-lg truncate">{user.nombre}</h3>
                        <span className={`shrink-0 ${rolColor}`}>
                          {user.rol}
                        </span>
                      </div>
                      <p className="text-white/20 text-xs font-mono mt-1">ID: {user.id}</p>
                      <p className="text-white/40 text-sm mt-2">{user.telefono}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-white/[0.06] opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      className="flex-1 px-3 py-2.5 text-xs bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
                      onClick={() =>
                        handleEditClient({
                          id: user.id,
                          nombre: user.nombre,
                          telefono: user.telefono,
                          entrenadorAsignadoId: null,
                          rol: user.rol,
                        })
                      }
                    >
                      <Edit size={14} className="inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, "client")}
                      className="px-3 py-2.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all rounded-lg border border-red-500/20 hover:border-red-500/40"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AnimatePresence>
        {editingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => handleEditClient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl shadow-black/50"
            >
              <div className="sticky top-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Editar</p>
                  <h3 className="text-white font-bold text-2xl">Modificar Cliente</h3>
                </div>
                <button
                  onClick={() => handleEditClient(null)}
                  className="p-2 hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Nombre</label>
                  <input
                    type="text"
                    value={editingClient.nombre}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Teléfono</label>
                  <input
                    type="text"
                    value={editingClient.telefono}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Entrenador</label>
                  <select
                    value={editingClient.entrenadorAsignadoId || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        entrenadorAsignadoId: e.target.value === "" ? null : e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-[#050505]">Sin entrenador</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id.toString()} className="bg-[#050505]">
                        {trainer.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Rol</label>
                  <select
                    value={editingClient.rol}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        rol: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                  >
                    <option value="ADMIN" className="bg-[#050505]">ADMIN</option>
                    <option value="ENTRENADOR" className="bg-[#050505]">ENTRENADOR</option>
                    <option value="CLIENTE" className="bg-[#050505]">CLIENTE</option>
                    <option value="CLIENTEESPERA" className="bg-[#050505]">CLIENTEESPERA</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">
                    Nueva Contraseña <span className="text-slate-600">(opcional)</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Dejar en blanco para no cambiar"
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => { handleEditClient(null); setNewPassword(""); }}
                    className="flex-1 px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all duration-300 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveWithPassword}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedClientHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClientHistory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl shadow-black/50"
            >
              <div className="sticky top-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Historial de Pagos</p>
                  <h3 className="text-white font-bold text-2xl">{selectedClientHistory.nombre}</h3>
                </div>
                <button
                  onClick={() => setSelectedClientHistory(null)}
                  className="p-2 hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6">
                {selectedClientHistory.membresias && selectedClientHistory.membresias.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClientHistory.membresias
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((membresia, index) => (
                        <div key={membresia.id} className="bg-white/[0.02] border border-white/10 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold">{membresia.tipo}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              membresia.estadoPago === 'PAGADO' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {membresia.estadoPago}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-slate-500 text-xs">Inicio</p>
                              <p className="text-white">{formatDate(membresia.fechaInicio)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Fin</p>
                              <p className="text-white">{formatDate(membresia.fechaFin)}</p>
                            </div>
                          </div>
                          <p className="text-slate-500 text-xs mt-2">
                            Creado: {new Date(membresia.createdAt).toLocaleDateString('es-ES', { 
                              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">No hay historial de pagos</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            src={selectedImage.src}
            alt={selectedImage.alt}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {qrClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setQrClient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl shadow-black/50"
            >
              <div className="text-center mb-6">
                <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Check-In QR</p>
                <h3 className="text-white font-bold text-2xl">{qrClient.nombre}</h3>
                <p className="text-slate-500 text-xs mt-2">ID: {qrClient.id}</p>
              </div>
              <div className="bg-white p-6 inline-block mx-auto">
                <QRCodeSVG value={`GYM:${qrClient.id}`} size={200} />
              </div>
              <p className="text-slate-400 text-xs text-center mt-6">
                Muestre este código al recibidor para registrar su entrada
              </p>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setQrClient(null)}
                  className="px-6 py-2 text-xs bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
