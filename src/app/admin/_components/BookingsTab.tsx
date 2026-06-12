"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, Trash, Users } from "lucide-react";
import { Booking } from "@/types/booking";
import dayjs from "@/lib/dayjs";

interface BookingsTabProps {
  searchBookings: string;
  setSearchBookings: (value: string) => void;
  filterBookingDate: string;
  setFilterBookingDate: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  bookingsPage: number;
  setBookingsPage: (value: number | ((prev: number) => number)) => void;
  bookingsPerPage: number;
  setBookingsPerPage: (value: number) => void;
  bookingsFilterStatus: string;
  setBookingsFilterStatus: (value: string) => void;
  bookingsFilterTrainer: string;
  setBookingsFilterTrainer: (value: string) => void;
  bookingsViewMode: "cards" | "list";
  setBookingsViewMode: (value: "cards" | "list") => void;
  trainers: { id: number; nombre: string }[];
  paginatedBookings: Booking[];
  totalBookingPages: number;
  sortedBookingsLength: number;
  handleDelete: (id: number | null, type: string) => void;
}

export default function BookingsTab({
  searchBookings,
  setSearchBookings,
  filterBookingDate,
  setFilterBookingDate,
  sortBy,
  setSortBy,
  bookingsPage,
  setBookingsPage,
  bookingsPerPage,
  setBookingsPerPage,
  bookingsFilterStatus,
  setBookingsFilterStatus,
  bookingsFilterTrainer,
  setBookingsFilterTrainer,
  bookingsViewMode,
  setBookingsViewMode,
  trainers,
  paginatedBookings,
  totalBookingPages,
  sortedBookingsLength,
  handleDelete,
}: BookingsTabProps) {
  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Reservas</p>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          Sesiones <span className="text-outline">Programadas</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Gestión de reservas y sesiones de entrenamiento.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente o entrenador..."
            value={searchBookings}
            onChange={(e) => {
              setSearchBookings(e.target.value);
              setBookingsPage(1);
            }}
            className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
        <input
          type="date"
          value={filterBookingDate}
          onChange={(e) => {
            setFilterBookingDate(e.target.value);
            setBookingsPage(1);
          }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-4 py-3 text-white focus:outline-none transition-colors"
        />
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setBookingsPage(1); }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-4 py-3 text-white focus:outline-none transition-colors"
        >
          <option value="fechaAsc" className="bg-[#050505]">Fecha Asc</option>
          <option value="fechaDesc" className="bg-[#050505]">Fecha Desc</option>
          <option value="cliente.nombre" className="bg-[#050505]">Cliente</option>
          <option value="entrenadorNombre" className="bg-[#050505]">Entrenador</option>
          <option value="estado" className="bg-[#050505]">Estado</option>
        </select>
        <select
          value={bookingsPerPage.toString()}
          onChange={(e) => { setBookingsPerPage(Number(e.target.value)); setBookingsPage(1); }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-4 py-3 text-white focus:outline-none transition-colors"
        >
          <option value="5" className="bg-[#050505]">5 por página</option>
          <option value="10" className="bg-[#050505]">10 por página</option>
          <option value="25" className="bg-[#050505]">25 por página</option>
          <option value="50" className="bg-[#050505]">50 por página</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select
          value={bookingsFilterStatus}
          onChange={(e) => { setBookingsFilterStatus(e.target.value); setBookingsPage(1); }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-0 py-3 text-white focus:outline-none transition-colors"
        >
          <option value="all" className="bg-[#050505]">Todos los estados</option>
          <option value="ACTIVA" className="bg-[#050505]">Activa</option>
          <option value="CANCELADA" className="bg-[#050505]">Cancelada</option>
        </select>
        <select
          value={bookingsFilterTrainer}
          onChange={(e) => { setBookingsFilterTrainer(e.target.value); setBookingsPage(1); }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-0 py-3 text-white focus:outline-none transition-colors"
        >
          <option value="all" className="bg-[#050505]">Todos los entrenadores</option>
          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.nombre} className="bg-[#050505]">
              {trainer.nombre}
            </option>
          ))}
        </select>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setBookingsViewMode("cards")}
            className={`px-4 py-2 border transition-colors ${
              bookingsViewMode === "cards"
                ? "border-[#02F5D4] text-[#02F5D4]"
                : "border-white/20 text-slate-400 hover:border-white/40"
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setBookingsViewMode("list")}
            className={`px-4 py-2 border transition-colors ${
              bookingsViewMode === "list"
                ? "border-[#02F5D4] text-[#02F5D4]"
                : "border-white/20 text-slate-400 hover:border-white/40"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-6">
        Mostrando {Math.min((bookingsPage - 1) * bookingsPerPage + 1, sortedBookingsLength)} -{" "}
        {Math.min(bookingsPage * bookingsPerPage, sortedBookingsLength)} de {sortedBookingsLength} resultados
      </p>

      {bookingsViewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {paginatedBookings.map((booking, index) => {
              const fecha = dayjs(booking.fecha);
              const estadoColor = booking.estado === "ACTIVA" ? "text-green-400" : "text-red-400";
              return (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="group"
                >
                  <div className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="shrink-0">
                        <div className="w-14 h-14 overflow-hidden border-2 border-white/10 group-hover:border-[#02F5D4]/40 transition-colors">
                          {booking.cliente?.foto ? (
                            <Image src={booking.cliente.foto} alt={booking.cliente.nombre} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                              <Users size={22} className="text-white/40" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-bold text-lg truncate">
                          {booking.cliente?.nombre || "Cliente"}
                        </h3>
                        <span className={`mt-2 inline-block text-xs font-mono uppercase tracking-wider ${estadoColor}`}>
                          {booking.estado}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fecha</span>
                        <span className="text-slate-300">{fecha.format("DD/MM/YYYY")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hora</span>
                        <span className="text-slate-300 font-mono">{fecha.format("HH:mm")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Entrenador</span>
                        <span className="text-slate-300 truncate ml-4">{booking.entrenadorNombre}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(booking.id, "booking")}
                        className="w-full px-3 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash size={14} className="inline mr-1" />
                        Eliminar
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
            {paginatedBookings.map((booking, index) => {
              const fecha = dayjs(booking.fecha);
              const estadoColor = booking.estado === "ACTIVA" ? "text-green-400" : "text-red-400";
              return (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="group"
                >
                  <div className="flex items-center gap-4 p-4 border-l-2 border-white/10 hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                    <div className="shrink-0">
                      <div className="w-12 h-12 overflow-hidden border border-white/10">
                        {booking.cliente?.foto ? (
                          <Image src={booking.cliente.foto} alt={booking.cliente.nombre} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                            <Users size={20} className="text-white/40" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 md:col-span-3">
                        <p className="text-white font-bold truncate">{booking.cliente?.nombre || "Cliente"}</p>
                        <p className="text-slate-600 text-xs font-mono mt-1">ID: {booking.id}</p>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Fecha</p>
                        <p className="text-slate-300 text-sm">{fecha.format("DD/MM/YYYY")}</p>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Hora</p>
                        <p className="text-slate-300 text-sm font-mono">{fecha.format("HH:mm")}</p>
                      </div>
                      <div className="col-span-12 md:col-span-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Entrenador</p>
                        <p className="text-slate-300 text-sm truncate">{booking.entrenadorNombre}</p>
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Estado</p>
                        <span className={`text-xs font-mono uppercase tracking-wider ${estadoColor}`}>
                          {booking.estado}
                        </span>
                      </div>
                      <div className="col-span-6 md:col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(booking.id, "booking")}
                          className="px-3 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
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

      {totalBookingPages > 1 && (
        <div className="flex items-center justify-between pt-8">
          <span className="text-slate-400 text-sm">
            Página {bookingsPage} de {totalBookingPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookingsPage((p: number) => Math.max(1, p - 1))}
              disabled={bookingsPage === 1}
              className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalBookingPages) }, (_, i) => {
              const start = Math.max(1, Math.min(bookingsPage - 2, totalBookingPages - 4));
              const pageNum = start + i;
              if (pageNum > totalBookingPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setBookingsPage(pageNum)}
                  className={`w-8 h-8 text-sm font-medium transition-colors ${
                    bookingsPage === pageNum
                      ? "bg-[#02F5D4] text-black"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setBookingsPage((p: number) => Math.min(totalBookingPages, p + 1))}
              disabled={bookingsPage === totalBookingPages}
              className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
