"use client";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, History, Scale, Trophy } from "lucide-react";
import { api, errorMsg } from "./api";
import { GraficoBarras, GraficoLinea } from "./Charts";
import type { Evolucion, FilaHistorial, Progreso } from "./types";
import { Boton, Cargando, Dato, ErrorEstado, VacioEstado, formatDuracion, formatFecha, formatKg } from "./ui";

interface Props {
  /** Si se indica, es la vista de solo lectura de un entrenador sobre uno de sus clientes. */
  clienteId?: number;
  onIrPeso?: () => void;
}

type Seccion = "resumen" | "ejercicios" | "records" | "historial";
const SECCIONES: { id: Seccion; texto: string; icono: typeof BarChart3 }[] = [
  { id: "resumen", texto: "Resumen", icono: BarChart3 },
  { id: "ejercicios", texto: "Cargas", icono: BarChart3 },
  { id: "records", texto: "Récords", icono: Trophy },
  { id: "historial", texto: "Historial", icono: History },
];
const unidad = (t: string) => (t === "PESO_MAXIMO" ? "kg" : t === "MAX_REPS" ? "reps" : "s");
const semana = (clave: string) => formatFecha(clave + "T12:00:00", { day: "numeric", month: "short" });
const mes = (clave: string) => new Date(clave + "-15T12:00:00").toLocaleDateString("es-ES", { month: "short" });

export default function ProgressView({ clienteId, onIrPeso }: Props) {
  const base = clienteId ? `/api/fitness/entrenador/clientes/${clienteId}/progreso` : "/api/fitness/progreso";
  const [sec, setSec] = useState<Seccion>("resumen");
  const [p, setP] = useState<Progreso | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    setP(null);
    try { setP(await api<Progreso>(base)); } catch (e) { setError(errorMsg(e)); }
  }, [base]);
  useEffect(() => { cargar(); }, [cargar]);

  if (error) return <ErrorEstado mensaje={error} onReintentar={cargar} />;
  if (!p) return <Cargando />;

  if (p.totales.sesiones === 0) {
    return (
      <VacioEstado
        icono={<BarChart3 size={26} />} titulo="Aún no hay progreso que mostrar"
        texto={clienteId ? "Este cliente todavía no ha completado ningún entrenamiento." : "Completa tu primer entrenamiento y aquí verás tu frecuencia, tus cargas y tus récords."}
        accion={!clienteId && onIrPeso ? <Boton variante="suave" onClick={onIrPeso}><Scale size={16} /> Registrar peso y medidas</Boton> : undefined}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Secciones de progreso" className="flex gap-1.5 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5">
        {SECCIONES.map((s) => (
          <button
            key={s.id} role="tab" aria-selected={sec === s.id} onClick={() => setSec(s.id)}
            className={`flex-1 min-h-[44px] px-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${sec === s.id ? "bg-[#02F5D4]/15 text-[#02F5D4]" : "text-white/50 hover:text-white"}`}
          >
            {s.texto}
          </button>
        ))}
      </div>

      {sec === "resumen" && <Resumen p={p} onIrPeso={clienteId ? undefined : onIrPeso} />}
      {sec === "ejercicios" && <Cargas p={p} base={base} />}
      {sec === "records" && <Records p={p} />}
      {sec === "historial" && <Historial inicial={p.historial} remoto={!clienteId} />}
    </div>
  );
}

function Resumen({ p, onIrPeso }: { p: Progreso; onIrPeso?: () => void }) {
  const total = p.frecuenciaSemanal.reduce((n, x) => n + x.sesiones, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { v: p.totales.sesiones, e: "Entrenos" }, { v: p.totales.series, e: "Series" },
          { v: p.totales.volumenKg > 0 ? formatKg(p.totales.volumenKg) : "—", e: "Volumen total" }, { v: formatDuracion(p.totales.duracionSeg), e: "Tiempo total" },
        ].map((d) => <div key={d.e} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><Dato valor={d.v} etiqueta={d.e} pequeno /></div>)}
      </div>
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h3 className="font-heading font-bold text-white">Frecuencia semanal</h3>
        <p className="text-xs text-white/40 mb-4">Entrenos completados por semana (lunes a domingo) · {total} en las últimas 12 semanas</p>
        <GraficoBarras etiquetaAccesible="Entrenos por semana en las últimas 12 semanas" datos={p.frecuenciaSemanal.map((x) => ({ etiqueta: semana(x.clave), valor: x.sesiones }))} />
      </section>
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h3 className="font-heading font-bold text-white">Frecuencia mensual</h3>
        <p className="text-xs text-white/40 mb-4">Entrenos completados por mes</p>
        <GraficoBarras etiquetaAccesible="Entrenos por mes en los últimos 6 meses" datos={p.frecuenciaMensual.map((x) => ({ etiqueta: mes(x.clave), valor: x.sesiones }))} />
      </section>
      {onIrPeso && (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 flex items-center justify-between gap-3">
          <div><h3 className="font-heading font-bold text-white">Peso corporal y medidas</h3><p className="text-xs text-white/45">Registro opcional con su propio historial.</p></div>
          <Boton variante="suave" onClick={onIrPeso}><Scale size={16} /> Abrir</Boton>
        </section>
      )}
      <p className="text-[11px] text-white/35 leading-relaxed">
        Cómo se calcula: el volumen suma peso × repeticiones de las series completadas con peso (los ejercicios por repeticiones o tiempo no suman volumen).
        Las semanas empiezan en lunes y se miden en la zona horaria del gimnasio.
      </p>
    </div>
  );
}

function Cargas({ p, base }: { p: Progreso; base: string }) {
  const [sel, setSel] = useState<number | null>(p.ejercicios[0]?.id ?? null);
  const [ev, setEv] = useState<Evolucion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sel) return;
    let activo = true;
    setEv(null);
    setError(null);
    api<Evolucion>(`${base}${base.includes("?") ? "&" : "?"}catalogoId=${sel}`).then((r) => activo && setEv(r)).catch((e) => activo && setError(errorMsg(e)));
    return () => { activo = false; };
  }, [sel, base]);

  if (p.ejercicios.length === 0) return <VacioEstado icono={<BarChart3 size={26} />} titulo="Sin cargas registradas" texto="Las cargas aparecen cuando completas series de ejercicios del catálogo." />;
  const titulo = ev?.unidad === "kg" ? "Peso máximo por sesión (kg)" : ev?.unidad === "reps" ? "Máximo de repeticiones por sesión" : "Mayor duración por sesión (s)";
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-xs text-white/50">Ejercicio</span>
        <select value={sel ?? ""} onChange={(e) => setSel(Number(e.target.value))} className="w-full min-h-[48px] rounded-xl bg-white/[0.04] border border-white/10 px-3 text-white focus:outline-none focus:border-[#02F5D4]/50">
          {p.ejercicios.map((e) => <option key={e.id} value={e.id} className="bg-[#0a0a0a]">{e.nombre}</option>)}
        </select>
      </label>
      {error ? <ErrorEstado mensaje={error} /> : !ev ? <Cargando /> : ev.puntos.length === 0 ? (
        <VacioEstado icono={<BarChart3 size={26} />} titulo="Sin datos válidos" texto="Este ejercicio aún no tiene series completadas con valores." />
      ) : (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="font-heading font-bold text-white">{ev.ejercicio.nombre}</h3>
          <p className="text-xs text-white/40 mb-3">{titulo} · {ev.puntos.length} sesión{ev.puntos.length === 1 ? "" : "es"}</p>
          <GraficoLinea etiquetaAccesible={`${titulo} de ${ev.ejercicio.nombre}`} unidad={ev.unidad} puntos={ev.puntos.map((x) => ({ x: formatFecha(x.fecha), y: x.valor }))} />
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
            <Dato pequeno etiqueta="Primera" valor={`${ev.puntos[0].valor} ${ev.unidad}`} />
            <Dato pequeno etiqueta="Última" valor={`${ev.puntos[ev.puntos.length - 1].valor} ${ev.unidad}`} />
            <Dato pequeno etiqueta="Mejor" valor={`${Math.max(...ev.puntos.map((x) => x.valor))} ${ev.unidad}`} />
          </div>
        </section>
      )}
    </div>
  );
}

function Records({ p }: { p: Progreso }) {
  if (p.records.length === 0) return <VacioEstado icono={<Trophy size={26} />} titulo="Sin récords todavía" texto="Tus mejores marcas se guardan al terminar cada entrenamiento." />;
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {p.records.map((r) => (
        <li key={r.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-white font-medium truncate">{r.ejercicio}</p><p className="text-xs text-white/40">{formatFecha(r.fecha, { day: "numeric", month: "short", year: "numeric" })}</p></div>
          <p className="font-heading font-black text-xl text-amber-300 tabular-nums shrink-0">{r.valor} <span className="text-xs font-medium">{unidad(r.tipo)}</span>{r.tipo === "PESO_MAXIMO" && r.reps ? <span className="text-xs text-white/40 font-medium"> ×{r.reps}</span> : null}</p>
        </li>
      ))}
    </ul>
  );
}

function Historial({ inicial, remoto }: { inicial?: FilaHistorial[]; remoto: boolean }) {
  const [filas, setFilas] = useState<FilaHistorial[] | null>(inicial ?? null);
  const [sig, setSig] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (cursor?: number) => {
    setCargando(true);
    setError(null);
    try {
      const r = await api<{ items: FilaHistorial[]; siguiente: number | null }>(`/api/fitness/sesiones${cursor ? `?cursor=${cursor}` : ""}`);
      setFilas((f) => (cursor ? [...(f ?? []), ...r.items] : r.items));
      setSig(r.siguiente);
    } catch (e) { setError(errorMsg(e)); } finally { setCargando(false); }
  }, []);
  useEffect(() => { if (remoto) cargar(); }, [remoto, cargar]);

  if (error) return <ErrorEstado mensaje={error} onReintentar={() => cargar()} />;
  if (!filas) return <Cargando />;
  if (filas.length === 0) return <VacioEstado icono={<History size={26} />} titulo="Sin historial" texto="Aquí aparecerán tus entrenamientos completados." />;
  return (
    <div className="space-y-2.5">
      <ul className="space-y-2.5">
        {filas.map((s) => (
          <li key={s.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-heading font-bold text-white truncate">{s.rutinaNombre}</p><p className="text-xs text-white/40">{formatFecha(s.finalizadaAt, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p></div>
              {s.records > 0 && <span className="shrink-0 text-xs text-amber-300">🏆 {s.records}</span>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/55">
              <span>{formatDuracion(s.duracionSeg)}</span><span>{s.totalEjercicios} ejercicios</span><span>{s.totalSeries ?? 0} series</span>
              {s.volumenKg ? <span>{formatKg(s.volumenKg)}</span> : null}
            </div>
          </li>
        ))}
      </ul>
      {remoto && sig && <div className="text-center"><Boton variante="suave" disabled={cargando} onClick={() => cargar(sig)}>{cargando ? "Cargando…" : "Cargar más"}</Boton></div>}
    </div>
  );
}
