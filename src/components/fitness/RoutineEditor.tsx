"use client";
import { FormEvent, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { DIAS_SEMANA } from "@/lib/fitness/constants";
import { errorMsg } from "./api";
import ExerciseCatalog from "./ExerciseCatalog";
import type { CatalogoEjercicio, LineaEditor, Rutina, RutinaInput } from "./types";
import { Boton, Chip, Modal, etiqueta } from "./ui";

const campo = "w-full min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#02F5D4]/50";

function Num({ etiquetaCampo, valor, onCambio, min = 0, max, paso = 1, opcional }: {
  etiquetaCampo: string; valor: number | null; onCambio: (v: number | null) => void; min?: number; max: number; paso?: number; opcional?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-[11px] text-white/40">{etiquetaCampo}</span>
      <input
        type="number" inputMode="decimal" min={min} max={max} step={paso} value={valor ?? ""}
        onChange={(e) => {
          if (e.target.value === "") return onCambio(opcional ? null : min);
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onCambio(Math.min(max, Math.max(min, n)));
        }}
        className={campo + " text-center tabular-nums"}
      />
    </label>
  );
}

let contador = 0;
const clave = () => `l${++contador}`;

export function lineasDesdeRutina(r: Rutina): LineaEditor[] {
  return r.ejercicios
    .filter((e) => e.catalogo)
    .map((e) => ({
      clave: clave(), catalogo: e.catalogo!, series: e.series, repeticiones: e.repeticiones, peso: e.peso,
      duracionSeg: e.duracionSeg, descansoSeg: e.descansoSeg, diaSemana: e.diaSemana, notas: e.notas,
    }));
}

interface Props {
  inicial?: Rutina | null;
  titulo: string;
  etiquetaGuardar: string;
  onGuardar: (input: RutinaInput) => Promise<void>;
  onCancelar: () => void;
}

export default function RoutineEditor({ inicial, titulo, etiquetaGuardar, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [lineas, setLineas] = useState<LineaEditor[]>(inicial ? lineasDesdeRutina(inicial) : []);
  const [eligiendo, setEligiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const sinCatalogo = inicial ? inicial.ejercicios.length - lineas.length : 0;

  const cambiar = (k: string, patch: Partial<LineaEditor>) => setLineas((ls) => ls.map((l) => (l.clave === k ? { ...l, ...patch } : l)));
  const mover = (i: number, d: -1 | 1) =>
    setLineas((ls) => {
      const j = i + d;
      if (j < 0 || j >= ls.length) return ls;
      const c = [...ls];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  const añadir = (e: CatalogoEjercicio) => {
    setLineas((ls) => [...ls, {
      clave: clave(), catalogo: e, series: 3, repeticiones: e.tipoMedicion === "SOLO_REPS" ? 12 : 10, peso: null,
      duracionSeg: e.tipoMedicion === "TIEMPO" ? 60 : null, descansoSeg: e.categoria === "CARDIO" ? null : 60, diaSemana: null, notas: null,
    }]);
    toast.info(`${e.nombre} añadido`, { autoClose: 1200 });
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    if (lineas.length === 0) return toast.error("Añade al menos un ejercicio");
    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(), descripcion: descripcion.trim() || null,
        ejercicios: lineas.map((l) => ({
          catalogoId: l.catalogo.id, series: l.series, repeticiones: l.repeticiones, peso: l.peso, duracionSeg: l.duracionSeg,
          descansoSeg: l.descansoSeg, diaSemana: l.diaSemana, notas: l.notas?.trim() || null,
        })),
      });
    } catch (e) {
      toast.error(errorMsg(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={titulo} onCerrar={onCancelar} ancho="max-w-3xl">
      <form onSubmit={enviar} className="space-y-4">
        <label className="block"><span className="text-xs text-white/50">Nombre de la rutina</span>
          <input required minLength={2} maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Empuje · Pecho y hombros" className={campo} /></label>
        <label className="block"><span className="text-xs text-white/50">Descripción (opcional)</span>
          <textarea maxLength={500} rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={campo + " py-2"} /></label>

        {sinCatalogo > 0 && (
          <p role="note" className="text-xs text-amber-300/90 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
            {sinCatalogo} ejercicio(s) de texto libre de la versión anterior no se pueden editar aquí y se descartarán al guardar.
          </p>
        )}

        {lineas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">Aún no hay ejercicios. Añade el primero desde el catálogo.</div>
        ) : (
          <ol className="space-y-3">
            {lineas.map((l, i) => {
              const t = l.catalogo.tipoMedicion;
              return (
                <li key={l.clave} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 sm:p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-white truncate"><span className="text-white/30 mr-2 tabular-nums">{i + 1}</span>{l.catalogo.nombre}</p>
                      <div className="flex gap-1.5 mt-1"><Chip color="cian">{etiqueta(l.catalogo.musculoPrincipal)}</Chip></div>
                    </div>
                    <div className="flex shrink-0">
                      <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir ${l.catalogo.nombre}`} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20"><ArrowUp size={16} /></button>
                      <button type="button" onClick={() => mover(i, 1)} disabled={i === lineas.length - 1} aria-label={`Bajar ${l.catalogo.nombre}`} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20"><ArrowDown size={16} /></button>
                      <button type="button" onClick={() => setLineas((ls) => ls.filter((x) => x.clave !== l.clave))} aria-label={`Quitar ${l.catalogo.nombre}`} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-400/70 hover:text-red-300"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <Num etiquetaCampo="Series" valor={l.series} min={1} max={20} onCambio={(v) => cambiar(l.clave, { series: v ?? 1 })} />
                    {t !== "TIEMPO" && <Num etiquetaCampo="Repeticiones" valor={l.repeticiones} min={1} max={999} onCambio={(v) => cambiar(l.clave, { repeticiones: v ?? 1 })} />}
                    {t === "TIEMPO" && <Num etiquetaCampo="Duración (s)" valor={l.duracionSeg} min={1} max={36000} onCambio={(v) => cambiar(l.clave, { duracionSeg: v ?? 1 })} />}
                    {t === "PESO_REPS" && <Num etiquetaCampo="Peso (kg)" valor={l.peso} max={1000} paso={0.5} opcional onCambio={(v) => cambiar(l.clave, { peso: v })} />}
                    <Num etiquetaCampo="Descanso (s)" valor={l.descansoSeg} max={1800} paso={5} opcional onCambio={(v) => cambiar(l.clave, { descansoSeg: v })} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <label className="block"><span className="text-[11px] text-white/40">Día</span>
                      <select value={l.diaSemana ?? ""} onChange={(e) => cambiar(l.clave, { diaSemana: e.target.value || null })} className={campo}>
                        <option value="" className="bg-[#0a0a0a]">Sin día fijo</option>
                        {DIAS_SEMANA.map((d) => <option key={d} value={d} className="bg-[#0a0a0a]">{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
                      </select></label>
                    <label className="block"><span className="text-[11px] text-white/40">Nota (opcional)</span>
                      <input maxLength={500} value={l.notas ?? ""} onChange={(e) => cambiar(l.clave, { notas: e.target.value })} className={campo} /></label>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <Boton variante="suave" onClick={() => setEligiendo(true)} className="w-full"><Plus size={16} /> Añadir ejercicio</Boton>

        <div className="flex gap-2 pt-2 sticky bottom-0 bg-[#0a0a0a] pb-1">
          <Boton variante="suave" onClick={onCancelar} className="flex-1">Cancelar</Boton>
          <Boton type="submit" disabled={guardando} className="flex-1">{guardando ? "Guardando…" : etiquetaGuardar}</Boton>
        </div>
      </form>

      {eligiendo && (
        <Modal titulo="Elegir ejercicio" onCerrar={() => setEligiendo(false)} ancho="max-w-3xl">
          <ExerciseCatalog modo="elegir" onElegir={añadir} />
        </Modal>
      )}
    </Modal>
  );
}
