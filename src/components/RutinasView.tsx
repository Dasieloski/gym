"use client";
import { useState, useEffect } from "react";
import { Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

interface Ejercicio {
  id: number;
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
  activa: boolean;
  ejercicios: Ejercicio[];
  creador: { nombre: string };
}

export default function RutinasView() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [openRutina, setOpenRutina] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/cliente/rutinas")
      .then(r => r.ok && r.json())
      .then(data => {
        if (data) setRutinas(data);
      })
      .catch(() => {});
  }, []);

  if (rutinas.length === 0) {
    return (
      <GlassCard>
        <div className="p-12 text-center">
          <Dumbbell size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">Sin Rutinas</h3>
          <p className="text-slate-400">Tu entrenador aún no te ha asignado una rutina de ejercicios.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {rutinas.map((r) => (
        <GlassCard key={r.id}>
          <div className="p-6">
            <button
              onClick={() => setOpenRutina(openRutina === r.id ? null : r.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="text-xl font-heading font-bold text-white">{r.nombre}</h3>
                {r.descripcion && <p className="text-white/50 text-sm mt-1">{r.descripcion}</p>}
                <p className="text-white/30 text-xs mt-1">Creada por: {r.creador.nombre} · {r.ejercicios.length} ejercicio(s)</p>
              </div>
              {openRutina === r.id ? <ChevronUp size={20} className="text-white/40" /> : <ChevronDown size={20} className="text-white/40" />}
            </button>

            {openRutina === r.id && (
              <div className="mt-6 space-y-3">
                {r.ejercicios.map((e) => (
                  <div key={e.id} className="p-4 border border-white/10 bg-white/[0.02] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-[#02F5D4]" />
                        <span className="text-white font-bold">{e.nombre}</span>
                      </div>
                      {e.diaSemana && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#2272FF]/10 text-[#2272FF] border border-[#2272FF]/20 rounded-full">
                          {e.diaSemana}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-white/60">
                      <span>{e.series} series</span>
                      <span>{e.repeticiones} reps</span>
                      {e.peso && <span>{e.peso} kg</span>}
                    </div>
                    {e.notas && <p className="text-white/40 text-xs mt-2 italic">{e.notas}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
