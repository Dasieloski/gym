"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, UserPlus, Users, X, User, Phone, Mail, Instagram, Calendar, Shield, Trash2 } from "lucide-react";
import { ClientType } from "@/types/client";

interface NewClientsTabProps {
  searchNewClients: string;
  setSearchNewClients: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  newClientsPage: number;
  setNewClientsPage: (value: number | ((prev: number) => number)) => void;
  newClientsPerPage: number;
  setNewClientsPerPage: (value: number) => void;
  newClientsViewMode: "cards" | "list";
  setNewClientsViewMode: (value: "cards" | "list") => void;
  paginatedNewClients: ClientType[];
  totalNewClientPages: number;
  sortedNewClientsLength: number;
  handleConvertToClient: (id: number) => Promise<void>;
  handleRejectClient: (id: number) => Promise<void>;
}

export default function NewClientsTab({
  searchNewClients,
  setSearchNewClients,
  sortBy,
  setSortBy,
  newClientsPage,
  setNewClientsPage,
  newClientsPerPage,
  setNewClientsPerPage,
  newClientsViewMode,
  setNewClientsViewMode,
  paginatedNewClients,
  totalNewClientPages,
  sortedNewClientsLength,
  handleConvertToClient,
  handleRejectClient,
}: NewClientsTabProps) {
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [showConfirmReject, setShowConfirmReject] = useState<ClientType | null>(null);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Nuevos Clientes</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Lista de <span className="text-outline">Espera</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Usuarios pendientes de activación.
        </p>
      </motion.div>

      <div className="mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchNewClients}
            onChange={(e) => {
              setSearchNewClients(e.target.value);
              setNewClientsPage(1);
            }}
            className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setNewClientsPage(1); }}
            className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-2 py-2 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="nombre" className="bg-[#050505]">Nombre</option>
            <option value="username" className="bg-[#050505]">Usuario</option>
            <option value="carnetIdentidad" className="bg-[#050505]">Carnet</option>
          </select>
          <select
            value={newClientsPerPage.toString()}
            onChange={(e) => { setNewClientsPerPage(Number(e.target.value)); setNewClientsPage(1); }}
            className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-2 py-2 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="5" className="bg-[#050505]">5</option>
            <option value="10" className="bg-[#050505]">10</option>
            <option value="25" className="bg-[#050505]">25</option>
            <option value="50" className="bg-[#050505]">50</option>
          </select>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setNewClientsViewMode("cards")}
              className={`p-2 border transition-colors ${
                newClientsViewMode === "cards"
                  ? "border-[#02F5D4] text-[#02F5D4]"
                  : "border-white/20 text-slate-400 hover:border-white/40"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setNewClientsViewMode("list")}
              className={`p-2 border transition-colors ${
                newClientsViewMode === "list"
                  ? "border-[#02F5D4] text-[#02F5D4]"
                  : "border-white/20 text-slate-400 hover:border-white/40"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-6">
        Mostrando {Math.min((newClientsPage - 1) * newClientsPerPage + 1, sortedNewClientsLength)} -{" "}
        {Math.min(newClientsPage * newClientsPerPage, sortedNewClientsLength)} de {sortedNewClientsLength} resultados
      </p>

      {newClientsViewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {paginatedNewClients.map((client, index) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="group"
              >
                <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
                  <div className="flex items-start gap-4 mb-4 cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <div className="shrink-0">
                      <div className="w-16 h-16 overflow-hidden border-2 border-white/10 group-hover:border-[#02F5D4]/40 transition-colors">
                        {client.foto ? (
                          <Image src={client.foto} alt={client.nombre} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                            <Users size={24} className="text-white/40" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-lg truncate">{client.nombre}</h3>
                      <p className="text-slate-500 text-xs font-mono mt-1">@{client.username}</p>
                      <span className="mt-2 inline-block text-xs font-mono uppercase tracking-wider text-yellow-400">
                        En espera
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Carnet</span>
                      <span className="text-slate-300">{client.carnetIdentidad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Teléfono</span>
                      <span className="text-slate-300">{client.telefono}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-sm transition-all duration-300 rounded-xl"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleConvertToClient(client.id);
                      }}
                    >
                      <UserPlus size={16} />
                      Aprobar
                    </button>
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition-colors border border-red-500/20"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setShowConfirmReject(client);
                      }}
                    >
                      <Trash2 size={16} />
                      Rechazar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {paginatedNewClients.map((client, index) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="group"
              >
                <div className="flex items-center gap-4 p-4 border-l-2 border-white/10 hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer" onClick={() => setSelectedClient(client)}>
                  <div className="shrink-0">
                    <div className="w-12 h-12 overflow-hidden border border-white/10">
                      {client.foto ? (
                        <Image src={client.foto} alt={client.nombre} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                          <Users size={20} className="text-white/40" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-3">
                      <p className="text-white font-bold truncate">{client.nombre}</p>
                      <p className="text-slate-600 text-xs font-mono mt-1">@{client.username}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Usuario</p>
                      <p className="text-slate-300 text-sm truncate">{client.username}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Carnet</p>
                      <p className="text-slate-300 text-sm">{client.carnetIdentidad}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                      <p className="text-slate-300 text-sm">{client.telefono}</p>
                    </div>
                    <div className="col-span-12 md:col-span-3 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold text-xs transition-all duration-300 rounded-lg"
                        onClick={async () => {
                          await handleConvertToClient(client.id);
                        }}
                      >
                        <UserPlus size={14} />
                        Aprobar
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors border border-red-500/20"
                        onClick={() => setShowConfirmReject(client)}
                      >
                        <Trash2 size={14} />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalNewClientPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <span className="text-slate-400 text-sm">
            Página {newClientsPage} de {totalNewClientPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewClientsPage((p: number) => Math.max(1, p - 1))}
              disabled={newClientsPage === 1}
              className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalNewClientPages) }, (_, i) => {
              const start = Math.max(1, Math.min(newClientsPage - 2, totalNewClientPages - 4));
              const pageNum = start + i;
              if (pageNum > totalNewClientPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setNewClientsPage(pageNum)}
                  className={`w-8 h-8 text-sm font-medium transition-colors ${
                    newClientsPage === pageNum
                      ? "bg-[#02F5D4] text-black"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setNewClientsPage((p: number) => Math.min(totalNewClientPages, p + 1))}
              disabled={newClientsPage === totalNewClientPages}
              className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/50lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">Detalle</p>
                  <h3 className="text-white font-bold text-2xl">{selectedClient.nombre}</h3>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 overflow-hidden border-2 border-white/10 shrink-0">
                    {selectedClient.foto ? (
                      <Image src={selectedClient.foto} alt={selectedClient.nombre} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                        <User size={32} className="text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-md uppercase tracking-wider">En Espera</span>
                    </div>
                    <p className="text-slate-500 text-xs font-mono">ID: {selectedClient.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-[#02F5D4] shrink-0" />
                    <div className="flex-1">
                      <p className="text-white/40 text-xs">Nombre</p>
                      <p className="text-white">{selectedClient.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 text-[#02F5D4] shrink-0 flex items-center justify-center text-xs font-mono">@</div>
                    <div className="flex-1">
                      <p className="text-white/40 text-xs">Username</p>
                      <p className="text-white">{selectedClient.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-[#02F5D4] shrink-0" />
                    <div className="flex-1">
                      <p className="text-white/40 text-xs">Teléfono</p>
                      <p className="text-white">{selectedClient.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield size={16} className="text-[#02F5D4] shrink-0" />
                    <div className="flex-1">
                      <p className="text-white/40 text-xs">Carnet de Identidad</p>
                      <p className="text-white font-mono">{selectedClient.carnetIdentidad}</p>
                    </div>
                  </div>
                  {(selectedClient as any).sexo && (
                    <div className="flex items-center gap-3 text-sm">
                      <User size={16} className="text-[#02F5D4] shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs">Sexo</p>
                        <p className="text-white">{(selectedClient as any).sexo}</p>
                      </div>
                    </div>
                  )}
                  {(selectedClient as any).email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-[#02F5D4] shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs">Email</p>
                        <p className="text-white text-sm">{(selectedClient as any).email}</p>
                      </div>
                    </div>
                  )}
                  {(selectedClient as any).instagram && (
                    <div className="flex items-center gap-3 text-sm">
                      <Instagram size={16} className="text-[#02F5D4] shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs">Instagram</p>
                        <p className="text-white text-sm">{(selectedClient as any).instagram}</p>
                      </div>
                    </div>
                  )}
                  {(selectedClient as any).fechaNacimiento && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-[#02F5D4] shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs">Fecha de Nacimiento</p>
                        <p className="text-white text-sm">{formatDate((selectedClient as any).fechaNacimiento)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={async () => {
                      await handleConvertToClient(selectedClient.id);
                      setSelectedClient(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    Aprobar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setShowConfirmReject(selectedClient);
                    }}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm border border-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Reject Modal */}
      <AnimatePresence>
        {showConfirmReject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmReject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/50md"
            >
              <div className="p-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-white font-bold text-xl text-center mb-2">Rechazar Cliente</h3>
                <p className="text-slate-400 text-sm text-center mb-6">
                  ¿Estás seguro de rechazar a <span className="text-white font-medium">{showConfirmReject.nombre}</span>? Esta acción eliminará toda su información de la base de datos y no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmReject(null)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      await handleRejectClient(showConfirmReject.id);
                      setShowConfirmReject(null);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar
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