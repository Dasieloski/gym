"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import { formatReloj } from "./ui";

interface Guardado { finalizaEn: number | null; restante: number | null; total: number }

const clave = (sesionId: number) => `fitness:descanso:${sesionId}`;

function leer(sesionId: number): Guardado | null {
  try {
    const raw = localStorage.getItem(clave(sesionId));
    return raw ? (JSON.parse(raw) as Guardado) : null;
  } catch {
    return null;
  }
}
function escribir(sesionId: number, g: Guardado | null) {
  try {
    if (g) localStorage.setItem(clave(sesionId), JSON.stringify(g));
    else localStorage.removeItem(clave(sesionId));
  } catch { /* almacenamiento no disponible: el temporizador sigue funcionando en memoria */ }
}

/**
 * Temporizador de descanso que sobrevive a recargas: guarda la hora de fin (o el tiempo restante si
 * está en pausa), de modo que el reloj no depende de que la pestaña siga viva.
 */
export function useDescanso(sesionId: number, alTerminar: () => void) {
  const [estado, setEstado] = useState<Guardado | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const terminar = useRef(alTerminar);
  terminar.current = alTerminar;

  useEffect(() => { setEstado(leer(sesionId)); }, [sesionId]);

  const restante = !estado ? 0 : estado.finalizaEn ? Math.max(0, Math.ceil((estado.finalizaEn - ahora) / 1000)) : estado.restante ?? 0;
  const enPausa = !!estado && !estado.finalizaEn;

  useEffect(() => {
    if (!estado?.finalizaEn) return;
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [estado?.finalizaEn]);

  useEffect(() => {
    if (estado?.finalizaEn && restante === 0) {
      escribir(sesionId, null);
      setEstado(null);
      terminar.current();
    }
  }, [estado, restante, sesionId]);

  const iniciar = useCallback((seg: number) => {
    const g = { finalizaEn: Date.now() + seg * 1000, restante: null, total: seg };
    setAhora(Date.now());
    setEstado(g);
    escribir(sesionId, g);
  }, [sesionId]);

  const omitir = useCallback(() => { escribir(sesionId, null); setEstado(null); }, [sesionId]);

  const alternarPausa = useCallback(() => {
    setEstado((e) => {
      if (!e) return e;
      const g: Guardado = e.finalizaEn
        ? { ...e, finalizaEn: null, restante: Math.max(0, Math.ceil((e.finalizaEn - Date.now()) / 1000)) }
        : { ...e, finalizaEn: Date.now() + (e.restante ?? 0) * 1000, restante: null };
      escribir(sesionId, g);
      return g;
    });
  }, [sesionId]);

  const sumar = useCallback((seg: number) => {
    setEstado((e) => {
      if (!e) return e;
      const g: Guardado = e.finalizaEn ? { ...e, finalizaEn: e.finalizaEn + seg * 1000, total: e.total + seg } : { ...e, restante: (e.restante ?? 0) + seg, total: e.total + seg };
      escribir(sesionId, g);
      return g;
    });
  }, [sesionId]);

  return { activo: !!estado, restante, enPausa, total: estado?.total ?? 0, iniciar, omitir, alternarPausa, sumar };
}

export function BarraDescanso({ d }: { d: ReturnType<typeof useDescanso> }) {
  if (!d.activo) return null;
  const pct = d.total ? Math.min(100, ((d.total - d.restante) / d.total) * 100) : 0;
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:left-72 px-3 pb-3 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
      <div role="timer" aria-label="Descanso" className="pointer-events-auto mx-auto max-w-xl rounded-2xl border border-[#02F5D4]/30 bg-[#0a0a0a] shadow-[0_0_30px_-8px_rgba(2,245,212,0.4)] overflow-hidden">
        <div className="h-1 bg-white/10" aria-hidden><div className="h-full bg-gradient-to-r from-[#2272FF] to-[#02F5D4] transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
        <div className="flex items-center gap-2 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-white/40">Descanso{d.enPausa ? " · en pausa" : ""}</p>
            <p className="font-heading font-black text-3xl text-white tabular-nums" aria-live="off">{formatReloj(d.restante)}</p>
          </div>
          <button onClick={() => d.sumar(15)} className="min-h-[48px] min-w-[56px] rounded-xl border border-white/10 text-white/70 text-sm hover:text-white" aria-label="Añadir 15 segundos">+15 s</button>
          <button onClick={d.alternarPausa} className="min-h-[48px] min-w-[48px] rounded-xl border border-white/10 text-white/80 flex items-center justify-center hover:text-white" aria-label={d.enPausa ? "Reanudar descanso" : "Pausar descanso"}>
            {d.enPausa ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button onClick={d.omitir} className="min-h-[48px] px-4 rounded-xl bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-[#04121a] font-bold text-sm flex items-center gap-1.5" aria-label="Omitir descanso">
            <SkipForward size={16} /> Omitir
          </button>
        </div>
      </div>
    </div>
  );
}
