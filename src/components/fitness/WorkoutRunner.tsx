"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Info, Minus, Plus, Square, Timer, X } from "lucide-react";
import { toast } from "react-toastify";
import { MAX_SERIES_POR_EJERCICIO } from "@/lib/fitness/constants";
import { api, errorMsg } from "./api";
import { BarraDescanso, useDescanso } from "./RestTimer";
import type { EjercicioSesion, ResumenSesion, Serie, Sesion } from "./types";
import { Boton, Chip, Modal, etiqueta, formatDuracion, formatReloj } from "./ui";

interface Borrador { peso: number | null; reps: number | null; dur: number | null }
const k = (ejId: number, n: number) => `${ejId}:${n}`;

function Stepper({ etiquetaCampo, valor, paso, min = 0, max, onCambio, unidad }: {
  etiquetaCampo: string; valor: number | null; paso: number; min?: number; max: number; onCambio: (v: number) => void; unidad: string;
}) {
  const v = valor ?? 0;
  const ajustar = (d: number) => onCambio(Math.min(max, Math.max(min, Math.round((v + d) * 100) / 100)));
  return (
    <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04]" role="group" aria-label={etiquetaCampo}>
      <button type="button" onClick={() => ajustar(-paso)} className="min-w-[40px] sm:min-w-[44px] min-h-[52px] flex items-center justify-center text-white/60 hover:text-white" aria-label={`Menos ${etiquetaCampo}`}><Minus size={16} /></button>
      <label className="flex-1 min-w-0 text-center">
        <span className="sr-only">{etiquetaCampo}</span>
        <input
          type="number" inputMode="decimal" value={valor ?? ""} min={min} max={max} step={paso}
          onChange={(e) => e.target.value !== "" && onCambio(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="w-full bg-transparent text-center font-heading font-bold text-xl text-white tabular-nums focus:outline-none"
        />
        <span className="block -mt-1 text-[10px] text-white/35" aria-hidden>{unidad}</span>
      </label>
      <button type="button" onClick={() => ajustar(paso)} className="min-w-[40px] sm:min-w-[44px] min-h-[52px] flex items-center justify-center text-white/60 hover:text-white" aria-label={`Más ${etiquetaCampo}`}><Plus size={16} /></button>
    </div>
  );
}

interface Props {
  sesion: Sesion;
  onResumen: (r: ResumenSesion) => void;
  onSalir: () => void; // sesión cancelada
}

export default function WorkoutRunner({ sesion: inicial, onResumen, onSalir }: Props) {
  const [sesion, setSesion] = useState(inicial);
  const [idx, setIdx] = useState(() => {
    const i = inicial.ejercicios.findIndex((e) => e.series.filter((s) => s.completada).length < e.seriesObjetivo);
    return i === -1 ? inicial.ejercicios.length - 1 : i;
  });
  const [borradores, setBorradores] = useState<Record<string, Borrador>>({});
  const [guardando, setGuardando] = useState<Set<string>>(new Set());
  const [extras, setExtras] = useState<Record<number, number>>({});
  const [ayuda, setAyuda] = useState(false);
  const [confirmar, setConfirmar] = useState<"finalizar" | "cancelar" | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cronometro, setCronometro] = useState<{ clave: string; desde: number } | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  const descanso = useDescanso(sesion.id, () => {
    toast.info("¡Descanso terminado!", { autoClose: 2500 });
    try { navigator.vibrate?.([200, 100, 200]); } catch { /* no soportado */ }
  });

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ej = sesion.ejercicios[idx];
  const totalCompletadas = useMemo(() => sesion.ejercicios.reduce((n, e) => n + e.series.filter((s) => s.completada).length, 0), [sesion]);
  const totalObjetivo = useMemo(() => sesion.ejercicios.reduce((n, e) => n + Math.max(e.seriesObjetivo, e.series.length), 0), [sesion]);
  const transcurrido = Math.max(0, Math.floor((ahora - new Date(sesion.iniciadaAt).getTime()) / 1000));

  const numerosSerie = useCallback((e: EjercicioSesion) => {
    const max = Math.max(e.seriesObjetivo + (extras[e.id] ?? 0), ...e.series.map((s) => s.numero));
    return Array.from({ length: Math.min(max, MAX_SERIES_POR_EJERCICIO) }, (_, i) => i + 1);
  }, [extras]);

  /** Valores mostrados: borrador > guardado > los de la serie anterior > objetivo de la rutina. */
  const valores = (e: EjercicioSesion, n: number, guardada?: Serie): Borrador => {
    const b = borradores[k(e.id, n)];
    if (b) return b;
    if (guardada && (guardada.completada || guardada.peso != null || guardada.repeticiones != null)) {
      return { peso: guardada.peso, reps: guardada.repeticiones, dur: guardada.duracionSeg };
    }
    const prev = e.series.filter((s) => s.completada && s.numero < n).sort((a, b2) => b2.numero - a.numero)[0];
    return {
      peso: prev ? prev.peso : e.pesoObjetivo,
      reps: prev ? prev.repeticiones : e.repsObjetivo,
      dur: prev ? prev.duracionSeg : e.duracionObjetivoSeg,
    };
  };

  const cambiar = (e: EjercicioSesion, n: number, base: Borrador, patch: Partial<Borrador>) =>
    setBorradores((b) => ({ ...b, [k(e.id, n)]: { ...base, ...patch } }));

  const actualizarSerie = (ejId: number, s: Serie) =>
    setSesion((ss) => ({
      ...ss,
      ejercicios: ss.ejercicios.map((e) => e.id !== ejId ? e : { ...e, series: [...e.series.filter((x) => x.numero !== s.numero), s].sort((a, b) => a.numero - b.numero) }),
    }));

  const alternarSerie = async (e: EjercicioSesion, n: number, guardada: Serie | undefined) => {
    const clave = k(e.id, n);
    if (guardando.has(clave)) return;
    const completar = !guardada?.completada;
    const v = valores(e, n, guardada);
    if (completar) {
      if (e.tipoMedicion === "TIEMPO" ? !(v.dur && v.dur > 0) : !(v.reps && v.reps > 0)) {
        return toast.warn(e.tipoMedicion === "TIEMPO" ? "Indica la duración" : "Indica las repeticiones");
      }
    }
    setGuardando((g) => new Set(g).add(clave));
    try {
      const s = await api<Serie>(`/api/fitness/sesiones/${sesion.id}/series`, {
        method: "PUT",
        body: { ejercicioId: e.id, numero: n, peso: v.peso, repeticiones: e.tipoMedicion === "TIEMPO" ? null : v.reps, duracionSeg: e.tipoMedicion === "TIEMPO" ? v.dur : null, completada: completar },
      });
      actualizarSerie(e.id, s);
      setBorradores((b) => { const c = { ...b }; delete c[clave]; return c; });
      if (completar) {
        if (cronometro?.clave === clave) setCronometro(null);
        const quedan = numerosSerie(e).some((x) => x !== n && !e.series.find((y) => y.numero === x)?.completada);
        if (quedan && e.descansoSeg) descanso.iniciar(e.descansoSeg);
        else if (!quedan) toast.success(`${e.nombre} completado`, { autoClose: 1500 });
      }
    } catch (err) {
      toast.error(errorMsg(err));
    } finally {
      setGuardando((g) => { const c = new Set(g); c.delete(clave); return c; });
    }
  };

  const finalizar = async () => {
    setEnviando(true);
    try {
      const r = await api<ResumenSesion>(`/api/fitness/sesiones/${sesion.id}/finalizar`, { method: "POST", body: {} });
      descanso.omitir();
      onResumen(r);
    } catch (err) {
      setConfirmar(null);
      toast.error(errorMsg(err));
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = async () => {
    setEnviando(true);
    try {
      await api(`/api/fitness/sesiones/${sesion.id}/cancelar`, { method: "POST" });
      descanso.omitir();
      toast.info("Entrenamiento cancelado");
      onSalir();
    } catch (err) {
      setConfirmar(null);
      toast.error(errorMsg(err));
    } finally {
      setEnviando(false);
    }
  };

  if (!ej) return null;
  const completadasEj = ej.series.filter((s) => s.completada).length;
  const objetivoTxt =
    ej.tipoMedicion === "TIEMPO" ? `${ej.seriesObjetivo} × ${formatDuracion(ej.duracionObjetivoSeg)}` :
    `${ej.seriesObjetivo} × ${ej.repsObjetivo ?? "—"}${ej.tipoMedicion === "PESO_REPS" && ej.pesoObjetivo ? ` · ${ej.pesoObjetivo} kg` : ""}`;

  return (
    <div className={`space-y-4 ${descanso.activo ? "pb-32" : "pb-6"}`}>
      <header className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[#02F5D4]/80">Entrenando</p>
            <h2 className="font-heading font-black text-xl text-white truncate">{sesion.rutinaNombre}</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="font-heading font-black text-2xl text-white tabular-nums" aria-label="Tiempo transcurrido">{formatReloj(transcurrido)}</p>
            <p className="text-[11px] text-white/40">{totalCompletadas}/{totalObjetivo} series</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={totalObjetivo} aria-valuenow={totalCompletadas} aria-label="Progreso del entrenamiento">
          <div className="h-full bg-gradient-to-r from-[#2272FF] to-[#02F5D4] transition-[width] duration-300" style={{ width: `${totalObjetivo ? (totalCompletadas / totalObjetivo) * 100 : 0}%` }} />
        </div>
      </header>

      <nav aria-label="Ejercicios" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {sesion.ejercicios.map((e, i) => {
          const hechas = e.series.filter((s) => s.completada).length;
          const listo = hechas >= e.seriesObjetivo;
          return (
            <button
              key={e.id} onClick={() => setIdx(i)} aria-current={i === idx ? "step" : undefined} aria-label={`Ejercicio ${i + 1}: ${e.nombre}${listo ? ", completado" : ""}`}
              className={`shrink-0 min-w-[44px] min-h-[44px] px-3 rounded-xl border text-sm font-bold tabular-nums transition-colors ${
                i === idx ? "border-[#02F5D4]/60 bg-[#02F5D4]/15 text-[#02F5D4]" : listo ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {listo && i !== idx ? <Check size={16} className="mx-auto" /> : i + 1}
            </button>
          );
        })}
      </nav>

      <section aria-label={ej.nombre} className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading font-black text-2xl text-white leading-tight">{ej.nombre}</h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {ej.catalogo && <Chip color="cian">{etiqueta(ej.catalogo.musculoPrincipal)}</Chip>}
              <Chip color="azul">Objetivo {objetivoTxt}</Chip>
              {ej.descansoSeg ? <Chip>Descanso {ej.descansoSeg} s</Chip> : null}
            </div>
          </div>
          {ej.catalogo && ej.catalogo.instrucciones.length > 0 && (
            <button onClick={() => setAyuda(true)} className="shrink-0 min-w-[44px] min-h-[44px] rounded-xl border border-white/10 text-white/60 hover:text-white flex items-center justify-center" aria-label="Ver cómo se hace"><Info size={18} /></button>
          )}
        </div>
        {ej.notas && <p className="mt-3 text-sm text-amber-200/80 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2">{ej.notas}</p>}

        <ol className="mt-4 space-y-2.5">
          {numerosSerie(ej).map((n) => {
            const guardada = ej.series.find((s) => s.numero === n);
            const hecha = !!guardada?.completada;
            const v = valores(ej, n, guardada);
            const clave = k(ej.id, n);
            const enCurso = guardando.has(clave);
            return (
              <li key={n} className={`rounded-2xl border p-3 ${hecha ? "border-emerald-500/25 bg-emerald-500/[0.06]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                {/* En móvil el botón de completar ocupa su propia fila para que los controles de peso y repeticiones tengan sitio. */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-6 sm:w-8 shrink-0 text-center font-heading font-black text-white/40 tabular-nums" aria-hidden>{n}</span>
                  <div className={`flex-1 grid gap-2 min-w-0 ${ej.tipoMedicion === "PESO_REPS" ? "grid-cols-2" : "grid-cols-1"} ${hecha ? "pointer-events-none opacity-70" : ""}`}>
                    {ej.tipoMedicion === "PESO_REPS" && <Stepper etiquetaCampo={`Peso serie ${n}`} unidad="kg" valor={v.peso} paso={2.5} max={1000} onCambio={(x) => cambiar(ej, n, v, { peso: x })} />}
                    {ej.tipoMedicion !== "TIEMPO" && <Stepper etiquetaCampo={`Repeticiones serie ${n}`} unidad="reps" valor={v.reps} paso={1} max={999} onCambio={(x) => cambiar(ej, n, v, { reps: x })} />}
                    {ej.tipoMedicion === "TIEMPO" && <Stepper etiquetaCampo={`Duración serie ${n}`} unidad="segundos" valor={v.dur} paso={5} max={36000} onCambio={(x) => cambiar(ej, n, v, { dur: x })} />}
                  </div>
                  </div>
                  <button
                    onClick={() => alternarSerie(ej, n, guardada)} disabled={enCurso} aria-pressed={hecha}
                    aria-label={hecha ? `Deshacer serie ${n}` : `Completar serie ${n}`}
                    className={`shrink-0 w-full sm:w-14 h-14 gap-2 rounded-2xl flex items-center justify-center font-bold text-[#04121a] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02F5D4] disabled:opacity-50 ${
                      hecha ? "bg-emerald-500 text-[#04121a]" : "bg-gradient-to-br from-[#2272FF] to-[#02F5D4] text-[#04121a] hover:shadow-lg hover:shadow-[#02F5D4]/25"
                    }`}
                  >
                    <Check size={26} strokeWidth={3} />
                    <span className="sm:hidden text-sm">{hecha ? "Hecha · toca para deshacer" : "Completar serie"}</span>
                  </button>
                </div>
                {ej.tipoMedicion === "TIEMPO" && !hecha && (
                  <div className="mt-2 pl-10">
                    {cronometro?.clave === clave ? (
                      <Boton variante="suave" className="w-full" onClick={() => { cambiar(ej, n, v, { dur: Math.max(1, Math.round((Date.now() - cronometro.desde) / 1000)) }); setCronometro(null); }}>
                        <Square size={14} /> Parar · {formatReloj(Math.floor((ahora - cronometro.desde) / 1000))}
                      </Boton>
                    ) : (
                      <Boton variante="fantasma" className="w-full" onClick={() => setCronometro({ clave, desde: Date.now() })}><Timer size={14} /> Cronometrar serie</Boton>
                    )}
                  </div>
                )}
                {hecha && guardada?.esRecord && <p className="mt-1 pl-10 text-xs text-amber-300">🏆 Nuevo récord personal</p>}
              </li>
            );
          })}
        </ol>

        {numerosSerie(ej).length < MAX_SERIES_POR_EJERCICIO && (
          <Boton variante="fantasma" className="w-full mt-3" onClick={() => setExtras((x) => ({ ...x, [ej.id]: (x[ej.id] ?? 0) + 1 }))}><Plus size={16} /> Añadir serie</Boton>
        )}
      </section>

      <div className="flex gap-2">
        <Boton variante="suave" onClick={() => setConfirmar("cancelar")} className="flex-1"><X size={16} /> Cancelar</Boton>
        {idx < sesion.ejercicios.length - 1 ? (
          <Boton onClick={() => setIdx(idx + 1)} className="flex-[2]" grande variante={completadasEj >= ej.seriesObjetivo ? "primario" : "suave"}>Siguiente ejercicio <ChevronRight size={18} /></Boton>
        ) : (
          <Boton onClick={() => setConfirmar("finalizar")} className="flex-[2]" grande>Terminar entrenamiento</Boton>
        )}
      </div>
      {idx < sesion.ejercicios.length - 1 && totalCompletadas > 0 && (
        <button onClick={() => setConfirmar("finalizar")} className="w-full min-h-[44px] text-sm text-white/50 hover:text-white underline underline-offset-4">Terminar ahora</button>
      )}

      <BarraDescanso d={descanso} />

      {ayuda && ej.catalogo && (
        <Modal titulo={ej.nombre} onCerrar={() => setAyuda(false)} ancho="max-w-lg">
          <ol className="space-y-2">
            {ej.catalogo.instrucciones.map((p, i) => <li key={i} className="flex gap-3 text-sm text-white/75"><span className="w-6 h-6 shrink-0 rounded-full bg-[#02F5D4]/10 text-[#02F5D4] text-xs font-bold flex items-center justify-center" aria-hidden>{i + 1}</span>{p}</li>)}
          </ol>
        </Modal>
      )}

      {confirmar === "finalizar" && (
        <Modal titulo="Terminar entrenamiento" onCerrar={() => setConfirmar(null)} ancho="max-w-md">
          <p className="text-white/70 text-sm mb-1">Has completado <b className="text-white">{totalCompletadas}</b> de {totalObjetivo} series.</p>
          {totalCompletadas === 0 && <p className="text-amber-300 text-sm mb-1">No has registrado ninguna serie: no se puede guardar un entrenamiento vacío.</p>}
          {totalObjetivo - totalCompletadas > 0 && totalCompletadas > 0 && <p className="text-white/50 text-sm mb-1">Las series pendientes no se contarán.</p>}
          <div className="flex gap-2 mt-5">
            <Boton variante="suave" className="flex-1" onClick={() => setConfirmar(null)}>Seguir</Boton>
            <Boton className="flex-1" disabled={enviando || totalCompletadas === 0} onClick={finalizar}>{enviando ? "Guardando…" : "Terminar y guardar"}</Boton>
          </div>
        </Modal>
      )}
      {confirmar === "cancelar" && (
        <Modal titulo="Cancelar entrenamiento" onCerrar={() => setConfirmar(null)} ancho="max-w-md">
          <p className="text-white/70 text-sm">Se descartará esta sesión y no aparecerá en tu historial ni en tus récords.</p>
          <div className="flex gap-2 mt-5">
            <Boton variante="suave" className="flex-1" onClick={() => setConfirmar(null)}>Seguir entrenando</Boton>
            <Boton variante="peligro" className="flex-1" disabled={enviando} onClick={cancelar}>{enviando ? "Cancelando…" : "Cancelar sesión"}</Boton>
          </div>
        </Modal>
      )}
    </div>
  );
}
