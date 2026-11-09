"use client";
import { Trophy } from "lucide-react";
import type { ResumenSesion } from "./types";
import { Boton, Dato, formatDuracion, formatKg } from "./ui";

const unidad = (tipo: string) => (tipo === "PESO_MAXIMO" ? "kg" : tipo === "MAX_REPS" ? "reps" : "s");

export default function WorkoutSummary({ r, onCerrar, onVerProgreso }: { r: ResumenSesion; onCerrar: () => void; onVerProgreso: () => void }) {
  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <div className="rounded-3xl border border-[#02F5D4]/25 bg-gradient-to-br from-[#02F5D4]/10 via-transparent to-[#2272FF]/10 p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#02F5D4]">Entrenamiento completado</p>
        <h2 className="font-heading font-black text-3xl text-white mt-2">{r.rutinaNombre}</h2>
        <p className="text-white/50 text-sm mt-1">Buen trabajo. Tu sesión ya está guardada.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { v: formatDuracion(r.duracionSeg), e: "Duración" },
          { v: `${r.ejerciciosRealizados}/${r.totalEjercicios}`, e: "Ejercicios" },
          { v: r.totalSeries, e: "Series" },
          { v: r.volumenKg > 0 ? formatKg(r.volumenKg) : "—", e: "Volumen" },
        ].map((d) => (
          <div key={d.e} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><Dato valor={d.v} etiqueta={d.e} pequeno /></div>
        ))}
      </div>
      {r.volumenKg === 0 && <p className="text-xs text-white/40 text-center -mt-2">El volumen solo cuenta series con peso y repeticiones.</p>}

      <section aria-label="Récords personales" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h3 className="flex items-center gap-2 font-heading font-bold text-white mb-3"><Trophy size={18} className="text-amber-300" aria-hidden /> Récords personales</h3>
        {r.records.length === 0 ? (
          <p className="text-sm text-white/50">Esta vez no has superado ninguna marca anterior. La primera vez que haces un ejercicio queda como tu marca de referencia.</p>
        ) : (
          <ul className="space-y-2">
            {r.records.map((x, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-sm">
                <span className="text-white">{x.ejercicio}</span>
                <span className="font-bold text-amber-300 tabular-nums">{x.valor} {unidad(x.tipo)}{x.tipo === "PESO_MAXIMO" && x.reps ? ` × ${x.reps}` : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col sm:flex-row gap-2">
        <Boton variante="suave" className="flex-1" onClick={onVerProgreso}>Ver mi progreso</Boton>
        <Boton className="flex-1" onClick={onCerrar} grande>Listo</Boton>
      </div>
    </div>
  );
}
