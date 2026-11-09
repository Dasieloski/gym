"use client";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LABELS } from "@/lib/fitness/constants";

export const etiqueta = (v: string) => LABELS[v] ?? v;

export function formatDuracion(seg: number | null | undefined): string {
  if (!seg || seg < 0) return "—";
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  if (h) return `${h} h ${m} min`;
  if (m) return `${m} min${s && m < 10 ? ` ${s} s` : ""}`;
  return `${s} s`;
}

export const formatReloj = (seg: number) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;

export const formatKg = (kg: number | null | undefined) =>
  kg == null ? "—" : `${Math.round(kg * 10) / 10 >= 10000 ? (kg / 1000).toFixed(1) + " t" : (Math.round(kg * 10) / 10).toLocaleString("es-ES") + " kg"}`;

export const formatFecha = (iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions) =>
  iso ? new Date(iso).toLocaleDateString("es-ES", opts ?? { day: "2-digit", month: "short" }) : "—";

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-white/50 text-sm">
      <Loader2 className="animate-spin" size={18} aria-hidden /> {texto}
    </div>
  );
}

export function ErrorEstado({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
      <AlertTriangle className="mx-auto mb-3 text-red-400" size={28} aria-hidden />
      <p className="text-white/80 text-sm mb-4">{mensaje}</p>
      {onReintentar && (
        <button onClick={onReintentar} className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-sm min-h-[44px]">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function VacioEstado({ icono, titulo, texto, accion }: { icono: ReactNode; titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#02F5D4]/15 to-[#2272FF]/15 border border-[#02F5D4]/20 flex items-center justify-center text-[#02F5D4]" aria-hidden>
        {icono}
      </div>
      <h3 className="font-heading font-bold text-lg text-white mb-1">{titulo}</h3>
      <p className="text-white/50 text-sm max-w-sm mx-auto mb-5">{texto}</p>
      {accion}
    </div>
  );
}

export function Boton({
  children, onClick, variante = "primario", disabled, type = "button", className, ariaLabel, grande,
}: {
  children: ReactNode; onClick?: () => void; variante?: "primario" | "suave" | "peligro" | "fantasma"; disabled?: boolean;
  type?: "button" | "submit"; className?: string; ariaLabel?: string; grande?: boolean;
}) {
  const estilos = {
    primario: "bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-[#04121a] font-bold hover:shadow-lg hover:shadow-[#02F5D4]/25",
    suave: "border border-white/10 text-white/80 hover:text-white hover:border-white/30 bg-white/[0.03]",
    peligro: "border border-red-500/25 text-red-300 bg-red-500/10 hover:bg-red-500/20",
    fantasma: "text-white/60 hover:text-white hover:bg-white/5",
  }[variante];
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02F5D4]",
        grande ? "min-h-[56px] px-6 text-base" : "min-h-[44px] px-4", estilos, className,
      )}
    >
      {children}
    </button>
  );
}

export function Chip({ children, color = "neutro" }: { children: ReactNode; color?: "neutro" | "cian" | "azul" | "ambar" | "verde" }) {
  const c = {
    neutro: "bg-white/5 text-white/60 border-white/10",
    cian: "bg-[#02F5D4]/10 text-[#02F5D4] border-[#02F5D4]/20",
    azul: "bg-[#2272FF]/10 text-[#7aa8ff] border-[#2272FF]/25",
    ambar: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    verde: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  }[color];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium", c)}>{children}</span>;
}

export function Dato({ valor, etiqueta: et, pequeno }: { valor: ReactNode; etiqueta: string; pequeno?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={cn("font-heading font-black text-white tabular-nums leading-none", pequeno ? "text-xl" : "text-3xl")}>{valor}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 mt-1.5">{et}</div>
    </div>
  );
}

export function Modal({ titulo, onCerrar, children, ancho = "max-w-2xl" }: { titulo: string; onCerrar: () => void; children: ReactNode; ancho?: string }) {
  // Se pinta en <body>: dentro del panel, los ancestros con transform/z-index lo dejarían bajo la barra lateral.
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    setMontado(true);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previo; };
  }, []);
  if (!montado) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={onCerrar}>
      <div
        role="dialog" aria-modal="true" aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onCerrar()}
        className={cn("w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0a0a0a] text-white shadow-2xl", ancho)}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/[0.06]">
          <h3 className="font-heading font-bold text-lg text-white truncate">{titulo}</h3>
          <button onClick={onCerrar} aria-label="Cerrar" className="min-w-[44px] min-h-[44px] rounded-xl text-white/50 hover:text-white hover:bg-white/5" autoFocus>
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
