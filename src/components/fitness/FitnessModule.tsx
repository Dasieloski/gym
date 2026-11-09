"use client";
import { useCallback, useEffect, useState } from "react";
import { Play } from "lucide-react";
import { toast } from "react-toastify";
import { ApiError, api, errorMsg, nuevaClave } from "./api";
import ExerciseCatalog from "./ExerciseCatalog";
import FitnessHome from "./FitnessHome";
import ProgressView from "./ProgressView";
import RoutineList from "./RoutineList";
import type { ResumenSesion, Sesion } from "./types";
import { Boton, Cargando } from "./ui";
import WorkoutRunner from "./WorkoutRunner";
import WorkoutSummary from "./WorkoutSummary";

export type SeccionFitness = "entreno" | "ejercicios" | "rutinas" | "progreso";
export const SECCIONES_FITNESS: SeccionFitness[] = ["entreno", "ejercicios", "rutinas", "progreso"];

interface Props {
  seccion: SeccionFitness;
  /** Cambia de pestaña en el panel del cliente (incluye pestañas ajenas al módulo, como "membresia" o "peso"). */
  onNavegar: (tab: string) => void;
}

/**
 * Orquesta la experiencia fitness del cliente. Mantiene en un solo sitio la sesión en curso para
 * que se pueda retomar desde cualquier sección (y tras recargar la página, porque el servidor es
 * la fuente de verdad).
 */
export default function FitnessModule({ seccion, onNavegar }: Props) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [vista, setVista] = useState<"normal" | "entrenando" | "resumen">("normal");
  const [resumen, setResumen] = useState<ResumenSesion | null>(null);
  const [listo, setListo] = useState(false);
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    api<{ sesion: Sesion | null }>("/api/fitness/sesiones/activa")
      .then((r) => { setSesion(r.sesion); if (r.sesion) setVista("entrenando"); })
      .catch(() => { /* sin sesión recuperable: se muestra la vista normal */ })
      .finally(() => setListo(true));
  }, []);

  const continuar = useCallback(() => { onNavegar("entreno"); setVista("entrenando"); }, [onNavegar]);

  const entrenar = useCallback(async (rutinaId: number, dia: string | null) => {
    if (iniciando) return;
    setIniciando(true);
    try {
      const s = await api<Sesion>("/api/fitness/sesiones", { method: "POST", body: { rutinaId, diaSemana: dia, claveCliente: nuevaClave() } });
      setSesion(s);
      setVista("entrenando");
      onNavegar("entreno");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.extra?.sesionActivaId) {
        toast.info("Ya tenías un entrenamiento en curso. Lo retomamos.");
        try {
          const r = await api<{ sesion: Sesion | null }>("/api/fitness/sesiones/activa");
          if (r.sesion) { setSesion(r.sesion); setVista("entrenando"); onNavegar("entreno"); }
        } catch (e2) { toast.error(errorMsg(e2)); }
      } else toast.error(errorMsg(e));
    } finally {
      setIniciando(false);
    }
  }, [iniciando, onNavegar]);

  if (!listo) return <Cargando />;

  if (vista === "resumen" && resumen) {
    return <WorkoutSummary r={resumen} onCerrar={() => { setResumen(null); setVista("normal"); }} onVerProgreso={() => { setResumen(null); setVista("normal"); onNavegar("progreso"); }} />;
  }
  if (vista === "entrenando" && sesion) {
    if (seccion === "entreno") {
      return (
        <WorkoutRunner
          key={sesion.id} sesion={sesion}
          onResumen={(r) => { setSesion(null); setResumen(r); setVista("resumen"); }}
          onSalir={() => { setSesion(null); setVista("normal"); }}
        />
      );
    }
  }

  return (
    <div className="space-y-5">
      {sesion && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#02F5D4]/30 bg-[#02F5D4]/10 p-4">
          <p className="text-sm text-white"><b>Entrenamiento en curso:</b> {sesion.rutinaNombre}</p>
          <Boton onClick={continuar}><Play size={16} /> Continuar</Boton>
        </div>
      )}
      {seccion === "entreno" && <FitnessHome onEntrenar={entrenar} onContinuar={continuar} onIr={(s) => onNavegar(s)} />}
      {seccion === "ejercicios" && (
        <div className="space-y-4">
          <div><h2 className="font-heading font-black text-2xl text-white">Ejercicios</h2><p className="text-white/50 text-sm">Consulta cómo se hace cada ejercicio, qué músculos trabaja y qué material necesitas.</p></div>
          <ExerciseCatalog />
        </div>
      )}
      {seccion === "rutinas" && <RoutineList onEntrenar={entrenar} sesionActivaId={sesion?.id ?? null} onContinuar={continuar} />}
      {seccion === "progreso" && (
        <div className="space-y-4">
          <div><h2 className="font-heading font-black text-2xl text-white">Mi progreso</h2><p className="text-white/50 text-sm">Todo calculado con tus entrenamientos reales.</p></div>
          <ProgressView onIrPeso={() => onNavegar("peso")} />
        </div>
      )}
    </div>
  );
}
