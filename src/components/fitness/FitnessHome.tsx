"use client";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bell, CalendarClock, ClipboardList, Dumbbell, Flame, Play, Trophy, UserRound } from "lucide-react";
import { api, errorMsg } from "./api";
import type { Inicio } from "./types";
import { Boton, Cargando, Chip, Dato, ErrorEstado, VacioEstado, formatDuracion, formatFecha, formatKg } from "./ui";

interface Props {
  onEntrenar: (rutinaId: number, dia: string | null) => void;
  onContinuar: () => void;
  onIr: (seccion: "rutinas" | "ejercicios" | "progreso" | "membresia") => void;
}

const ESTADO_MEMBRESIA: Record<string, { texto: string; color: "verde" | "ambar" | "neutro" }> = {
  ACTIVA: { texto: "Activa", color: "verde" },
  POR_VENCER: { texto: "Por vencer", color: "ambar" },
  VENCIDA: { texto: "Vencida", color: "ambar" },
  CONGELADA: { texto: "Congelada", color: "neutro" },
  SIN_MEMBRESIA: { texto: "Sin membresía", color: "neutro" },
};
const unidad = (t: string) => (t === "PESO_MAXIMO" ? "kg" : t === "MAX_REPS" ? "reps" : "s");

export default function FitnessHome({ onEntrenar, onContinuar, onIr }: Props) {
  const [d, setD] = useState<Inicio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try { setD(await api<Inicio>("/api/fitness/inicio")); } catch (e) { setError(errorMsg(e)); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  if (error) return <ErrorEstado mensaje={error} onReintentar={cargar} />;
  if (!d) return <Cargando />;

  const estado = ESTADO_MEMBRESIA[d.estadoMembresia];
  const nuevo = d.totalRutinas === 0 && d.ultimasSesiones.length === 0;
  const alerta = d.estadoMembresia === "VENCIDA" || d.estadoMembresia === "POR_VENCER";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">Hola, {d.nombre.split(" ")[0]}</h2>
        <p className="text-white/50 text-sm mt-1">{d.hoy.dia.charAt(0) + d.hoy.dia.slice(1).toLowerCase()}, {formatFecha(new Date().toISOString(), { day: "numeric", month: "long" })}</p>
      </div>

      {alerta && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
          <AlertTriangle className="text-amber-300 shrink-0 mt-0.5" size={18} aria-hidden />
          <div className="text-sm text-amber-100/90">
            {d.estadoMembresia === "VENCIDA" ? "Tu membresía venció." : `Tu membresía vence en ${d.membresia?.diasRestantes} día(s).`}{" "}
            Tus rutinas y tu historial siguen guardados.{" "}
            <button onClick={() => onIr("membresia")} className="underline underline-offset-2 font-medium">Ver membresía</button>
          </div>
        </div>
      )}

      {d.sesionActiva ? (
        <div className="rounded-3xl border border-[#02F5D4]/30 bg-gradient-to-br from-[#02F5D4]/15 to-[#2272FF]/10 p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#02F5D4]">Entrenamiento en curso</p>
          <h3 className="font-heading font-black text-2xl text-white mt-1">{d.sesionActiva.rutinaNombre}</h3>
          <p className="text-white/50 text-sm">Empezó a las {new Date(d.sesionActiva.iniciadaAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
          <Boton grande className="mt-4 w-full sm:w-auto" onClick={onContinuar}><Play size={18} /> Continuar entrenamiento</Boton>
        </div>
      ) : nuevo ? (
        <VacioEstado
          icono={<Dumbbell size={26} />} titulo="Empecemos a entrenar"
          texto="Crea tu primera rutina con ejercicios del catálogo o espera a que tu entrenador te asigne una. Aquí verás tu progreso real."
          accion={<div className="flex flex-wrap gap-2 justify-center"><Boton onClick={() => onIr("rutinas")}><ClipboardList size={16} /> Crear rutina</Boton><Boton variante="suave" onClick={() => onIr("ejercicios")}>Ver ejercicios</Boton></div>}
        />
      ) : (
        <section aria-label="Entrenamiento de hoy" className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Hoy</p>
          {d.hoy.rutinas.length > 0 ? (
            <ul className="mt-2 space-y-3">
              {d.hoy.rutinas.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-black text-xl text-white truncate">{r.nombre}</p>
                    <p className="text-white/50 text-sm">{r.ejercicios} ejercicios · {r.tipo === "ASIGNADA" ? "de tu entrenador" : "personal"}</p>
                  </div>
                  <Boton onClick={() => onEntrenar(r.id, r.diaSemana)} ariaLabel={`Entrenar ${r.nombre}`}><Play size={16} /> Entrenar</Boton>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2">
              <p className="font-heading font-bold text-lg text-white">No tienes nada programado para hoy</p>
              <p className="text-white/50 text-sm mt-1 mb-4">Puedes entrenar cualquiera de tus rutinas cuando quieras.</p>
              <Boton variante="suave" onClick={() => onIr("rutinas")}><ClipboardList size={16} /> Elegir una rutina</Boton>
            </div>
          )}
        </section>
      )}

      <section aria-label="Resumen semanal" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-white flex items-center gap-2"><Flame size={17} className="text-[#02F5D4]" aria-hidden /> Esta semana</h3>
          <button onClick={() => onIr("progreso")} className="text-xs text-[#02F5D4] hover:underline min-h-[44px] px-1">Ver progreso</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Dato valor={d.semana.sesiones} etiqueta="Entrenos" />
          <Dato valor={d.semana.series} etiqueta="Series" />
          <Dato valor={d.semana.volumenKg > 0 ? formatKg(d.semana.volumenKg) : "—"} etiqueta="Volumen" />
          <Dato valor={d.semana.duracionSeg ? formatDuracion(d.semana.duracionSeg) : "—"} etiqueta="Tiempo" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-label="Membresía y gimnasio" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-white">Mi membresía</h3>
            <Chip color={estado.color}>{estado.texto}</Chip>
          </div>
          {d.membresia ? (
            <p className="text-sm text-white/60">Plan {d.membresia.tipo.toLowerCase()} · vence el {formatFecha(d.membresia.fechaFin, { day: "2-digit", month: "long", year: "numeric" })}</p>
          ) : (
            <p className="text-sm text-white/50">No tienes una membresía registrada.</p>
          )}
          <div className="flex items-center gap-2 text-sm text-white/60"><CalendarClock size={15} aria-hidden /> {d.asistenciasMes} asistencia{d.asistenciasMes === 1 ? "" : "s"} este mes</div>
          {d.proximaReserva && <div className="text-sm text-white/60">Próxima reserva: {formatFecha(d.proximaReserva.fecha, { weekday: "short", day: "numeric", month: "short" })}</div>}
          {d.entrenador && <div className="flex items-center gap-2 text-sm text-white/60"><UserRound size={15} aria-hidden /> Entrenador: {d.entrenador.nombre}</div>}
        </section>

        <section aria-label="Avisos" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="font-heading font-bold text-white flex items-center gap-2 mb-3"><Bell size={16} className="text-[#02F5D4]" aria-hidden /> Avisos</h3>
          {d.avisos.length === 0 ? <p className="text-sm text-white/40">No tienes avisos sin leer.</p> : (
            <ul className="space-y-2.5">
              {d.avisos.map((a) => <li key={a.id}><p className="text-sm text-white">{a.titulo}</p><p className="text-xs text-white/45">{a.mensaje}</p></li>)}
            </ul>
          )}
        </section>

        <section aria-label="Últimos entrenamientos" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="font-heading font-bold text-white mb-3">Últimos entrenamientos</h3>
          {d.ultimasSesiones.length === 0 ? <p className="text-sm text-white/40">Cuando termines tu primer entrenamiento aparecerá aquí.</p> : (
            <ul className="space-y-2.5">
              {d.ultimasSesiones.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white truncate">{s.rutinaNombre}</span>
                  <span className="shrink-0 text-white/45 text-xs">{formatFecha(s.finalizadaAt)} · {formatDuracion(s.duracionSeg)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Récords personales" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="font-heading font-bold text-white flex items-center gap-2 mb-3"><Trophy size={16} className="text-amber-300" aria-hidden /> Mejores marcas</h3>
          {d.records.length === 0 ? <p className="text-sm text-white/40">Tus marcas personales se registrarán al terminar entrenamientos.</p> : (
            <ul className="space-y-2.5">
              {d.records.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white truncate">{r.ejercicio}</span>
                  <span className="shrink-0 font-bold text-amber-300 tabular-nums">{r.valor} {unidad(r.tipo)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {([["rutinas", "Rutinas", ClipboardList], ["ejercicios", "Ejercicios", Dumbbell], ["progreso", "Progreso", Trophy]] as const).map(([id, texto, Icono]) => (
          <button key={id} onClick={() => onIr(id)} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-[#02F5D4]/30 min-h-[88px] flex flex-col items-center justify-center gap-2 text-white/80 text-sm transition-colors">
            <Icono size={22} className="text-[#02F5D4]" aria-hidden /> {texto}
          </button>
        ))}
      </div>
    </div>
  );
}
