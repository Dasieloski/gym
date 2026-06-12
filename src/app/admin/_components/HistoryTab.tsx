"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/glass-card";

interface Historial {
  id: string;
  accion: string;
  descripcion: string;
  usuario: { nombre: string };
  entrenador?: { usuario: { nombre: string } };
  membresia?: { tipo: string };
  reserva?: { fecha: string };
  fecha: string;
}

interface HistoryTabProps {
  searchHistory: string;
  setSearchHistory: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  filteredHistory: Historial[];
}

export default function HistoryTab({
  searchHistory,
  setSearchHistory,
  sortBy,
  setSortBy,
  filteredHistory,
}: HistoryTabProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <div className="relative w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Buscar en historial..."
            className="w-full sm:w-64 pl-10 pr-4 bg-white/[0.03] border border-white/10 text-white placeholder:text-white/40"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-white/40" size={20} />
        </div>
        <Select onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-auto bg-white/[0.03] border-white/10 text-white">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-[#050505] border-white/10">
            <SelectItem value="date" className="text-white focus:bg-white/10 focus:text-white">Fecha</SelectItem>
            <SelectItem value="action" className="text-white focus:bg-white/10 focus:text-white">Acción</SelectItem>
            <SelectItem value="user" className="text-white focus:bg-white/10 focus:text-white">Usuario</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(filteredHistory) &&
          filteredHistory.map((item: Historial) => (
            <GlassCard key={item.id}>
              <h3 className="text-lg font-semibold mb-2 text-white font-heading">{item.accion}</h3>
              <p className="text-sm text-white/60 mb-1 font-sans">Descripción: {item.descripcion}</p>
              <p className="text-sm text-white/60 mb-1 font-sans">Usuario: {item.usuario.nombre}</p>
              {item.entrenador && (
                <p className="text-sm text-white/60 mb-1 font-sans">
                  Entrenador: {item.entrenador.usuario.nombre}
                </p>
              )}
              {item.membresia && (
                <p className="text-sm text-white/60 mb-1 font-sans">Membresía: {item.membresia.tipo}</p>
              )}
              {item.reserva && (
                <p className="text-sm text-white/60 mb-1 font-sans">
                  Reserva: {new Date(item.reserva.fecha).toLocaleString()}
                </p>
              )}
              <p className="text-sm text-white/60 mb-1 font-sans">Fecha: {new Date(item.fecha).toLocaleString()}</p>
            </GlassCard>
          ))}
      </div>
    </div>
  );
}
