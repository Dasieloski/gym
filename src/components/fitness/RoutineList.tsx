"use client";
import { useCallback, useEffect, useState } from "react";
import { Archive, ArchiveRestore, ClipboardList, Copy, Pencil, Play, Plus, Trash2, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMsg } from "./api";
import RoutineEditor from "./RoutineEditor";
import type { Rutina, RutinaInput } from "./types";
import { Boton, Cargando, Chip, ErrorEstado, Modal, VacioEstado, etiqueta, formatDuracion } from "./ui";

interface Props {
  onEntrenar: (rutinaId: number, dia: string | null) => void;
  /** Id de la sesión en curso: mientras exista no se puede empezar otra rutina. */
  sesionActivaId: number | null;
  onContinuar: () => void;
}

export function agruparPorDia(r: Rutina): { dia: string | null; ejercicios: Rutina["ejercicios"] }[] {
  const mapa = new Map<string | null, Rutina["ejercicios"]>();
  r.ejercicios.forEach((e) => mapa.set(e.diaSemana, [...(mapa.get(e.diaSemana) ?? []), e]));
  return Array.from(mapa.entries()).map(([dia, ejercicios]) => ({ dia, ejercicios }));
}

function Detalle({ r }: { r: Rutina }) {
  return (
    <div className="mt-4 space-y-4">
      {agruparPorDia(r).map((g) => (
        <div key={g.dia ?? "sin"}>
          {(g.dia || agruparPorDia(r).length > 1) && <p className="text-[11px] uppercase tracking-wider text-[#02F5D4]/80 mb-1.5">{g.dia ?? "Cualquier día"}</p>}
          <ul className="space-y-1.5">
            {g.ejercicios.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 text-sm">
                <span className="text-white/90 min-w-0 truncate">{e.nombre}</span>
                <span className="shrink-0 text-white/50 tabular-nums text-xs">
                  {e.series}×{e.catalogo?.tipoMedicion === "TIEMPO" ? formatDuracion(e.duracionSeg) : e.repeticiones}
                  {e.peso ? ` · ${e.peso} kg` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Tarjeta({ r, abierta, onAbrir, children }: { r: Rutina; abierta: boolean; onAbrir: () => void; children: React.ReactNode }) {
  const musculos = Array.from(new Set(r.ejercicios.map((e) => e.catalogo?.musculoPrincipal).filter(Boolean) as string[])).slice(0, 3);
  return (
    <li className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 sm:p-5">
      <button onClick={onAbrir} aria-expanded={abierta} className="w-full text-left min-h-[44px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#02F5D4]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-white text-lg leading-snug">{r.nombre}</h3>
            {r.descripcion && <p className="text-white/50 text-sm mt-0.5 line-clamp-2">{r.descripcion}</p>}
          </div>
          <span className="text-white/30 text-xs shrink-0 mt-1" aria-hidden>{abierta ? "Ocultar" : "Ver"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {r.tipo === "ASIGNADA" ? <Chip color="azul">Asignada por {r.creador.nombre}</Chip> : <Chip color="cian">Personal</Chip>}
          <Chip>{r.ejercicios.length} ejercicio{r.ejercicios.length === 1 ? "" : "s"}</Chip>
          {musculos.map((m) => <Chip key={m}>{etiqueta(m)}</Chip>)}
        </div>
      </button>
      {abierta && <Detalle r={r} />}
      <div className="flex flex-wrap gap-2 mt-4">{children}</div>
    </li>
  );
}

export default function RoutineList({ onEntrenar, sesionActivaId, onContinuar }: Props) {
  const [rutinas, setRutinas] = useState<Rutina[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<number | null>(null);
  const [editor, setEditor] = useState<{ rutina: Rutina | null } | null>(null);
  const [borrar, setBorrar] = useState<Rutina | null>(null);
  const [dias, setDias] = useState<Rutina | null>(null);
  const [ocupada, setOcupada] = useState<number | null>(null);
  const [verArchivadas, setVerArchivadas] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setRutinas(await api<Rutina[]>("/api/fitness/rutinas"));
    } catch (e) {
      setError(errorMsg(e));
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (input: RutinaInput) => {
    if (editor?.rutina) await api(`/api/fitness/rutinas/${editor.rutina.id}`, { method: "PUT", body: input });
    else await api("/api/fitness/rutinas", { method: "POST", body: input });
    toast.success(editor?.rutina ? "Rutina actualizada" : "Rutina creada");
    setEditor(null);
    cargar();
  };

  const accion = async (r: Rutina, fn: () => Promise<unknown>, ok: string) => {
    setOcupada(r.id);
    try { await fn(); toast.success(ok); await cargar(); } catch (e) { toast.error(errorMsg(e)); } finally { setOcupada(null); }
  };

  const empezar = (r: Rutina) => {
    if (sesionActivaId) return onContinuar();
    const distintos = new Set(r.ejercicios.map((e) => e.diaSemana).filter(Boolean));
    if (distintos.size > 1) return setDias(r);
    onEntrenar(r.id, distintos.size === 1 ? (Array.from(distintos)[0] as string) : null);
  };

  if (error) return <ErrorEstado mensaje={error} onReintentar={cargar} />;
  if (!rutinas) return <Cargando />;

  const asignadas = rutinas.filter((r) => r.tipo === "ASIGNADA");
  const personales = rutinas.filter((r) => r.tipo === "PERSONAL" && r.activa);
  const archivadas = rutinas.filter((r) => r.tipo === "PERSONAL" && !r.activa);

  const botonEntrenar = (r: Rutina) => (
    <Boton onClick={() => empezar(r)} disabled={ocupada === r.id}><Play size={16} /> {sesionActivaId ? "Continuar entreno" : "Entrenar"}</Boton>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-2xl text-white">Mis rutinas</h2>
          <p className="text-white/50 text-sm">Crea las tuyas y consulta las que te asigna tu entrenador.</p>
        </div>
        <Boton onClick={() => setEditor({ rutina: null })}><Plus size={16} /> <span className="hidden sm:inline">Nueva rutina</span><span className="sm:hidden">Nueva</span></Boton>
      </div>

      {rutinas.length === 0 && (
        <VacioEstado
          icono={<ClipboardList size={26} />} titulo="Todavía no tienes rutinas"
          texto="Crea tu primera rutina eligiendo ejercicios del catálogo. Si tienes entrenador, sus rutinas aparecerán aquí."
          accion={<Boton onClick={() => setEditor({ rutina: null })}><Plus size={16} /> Crear mi primera rutina</Boton>}
        />
      )}

      {asignadas.length > 0 && (
        <section aria-labelledby="h-asig" className="space-y-3">
          <h3 id="h-asig" className="flex items-center gap-2 text-sm uppercase tracking-wider text-white/50"><UserCheck size={15} aria-hidden /> De tu entrenador</h3>
          <p className="text-xs text-white/40 -mt-1">Son de solo lectura. Para adaptarlas, crea una copia personal.</p>
          <ul className="space-y-3">
            {asignadas.map((r) => (
              <Tarjeta key={r.id} r={r} abierta={abierta === r.id} onAbrir={() => setAbierta(abierta === r.id ? null : r.id)}>
                {botonEntrenar(r)}
                <Boton variante="suave" disabled={ocupada === r.id} onClick={() => accion(r, () => api(`/api/fitness/rutinas/${r.id}/duplicar`, { method: "POST" }), "Copia personal creada")}><Copy size={16} /> Crear copia personal</Boton>
              </Tarjeta>
            ))}
          </ul>
        </section>
      )}

      {personales.length > 0 && (
        <section aria-labelledby="h-pers" className="space-y-3">
          <h3 id="h-pers" className="text-sm uppercase tracking-wider text-white/50">Personales</h3>
          <ul className="space-y-3">
            {personales.map((r) => (
              <Tarjeta key={r.id} r={r} abierta={abierta === r.id} onAbrir={() => setAbierta(abierta === r.id ? null : r.id)}>
                {botonEntrenar(r)}
                <Boton variante="suave" onClick={() => setEditor({ rutina: r })} ariaLabel={`Editar ${r.nombre}`}><Pencil size={16} /> Editar</Boton>
                <Boton variante="suave" disabled={ocupada === r.id} onClick={() => accion(r, () => api(`/api/fitness/rutinas/${r.id}/duplicar`, { method: "POST" }), "Rutina duplicada")} ariaLabel={`Duplicar ${r.nombre}`}><Copy size={16} /></Boton>
                <Boton variante="suave" disabled={ocupada === r.id} onClick={() => accion(r, () => api(`/api/fitness/rutinas/${r.id}`, { method: "PATCH", body: { archivada: true } }), "Rutina archivada")} ariaLabel={`Archivar ${r.nombre}`}><Archive size={16} /></Boton>
                <Boton variante="peligro" onClick={() => setBorrar(r)} ariaLabel={`Eliminar ${r.nombre}`}><Trash2 size={16} /></Boton>
              </Tarjeta>
            ))}
          </ul>
        </section>
      )}

      {archivadas.length > 0 && (
        <section aria-labelledby="h-arch" className="space-y-3">
          <button id="h-arch" onClick={() => setVerArchivadas(!verArchivadas)} aria-expanded={verArchivadas} className="text-sm uppercase tracking-wider text-white/50 hover:text-white/80 min-h-[44px]">
            Archivadas ({archivadas.length}) {verArchivadas ? "▴" : "▾"}
          </button>
          {verArchivadas && (
            <ul className="space-y-3">
              {archivadas.map((r) => (
                <Tarjeta key={r.id} r={r} abierta={abierta === r.id} onAbrir={() => setAbierta(abierta === r.id ? null : r.id)}>
                  <Boton variante="suave" disabled={ocupada === r.id} onClick={() => accion(r, () => api(`/api/fitness/rutinas/${r.id}`, { method: "PATCH", body: { archivada: false } }), "Rutina restaurada")}><ArchiveRestore size={16} /> Restaurar</Boton>
                  <Boton variante="peligro" onClick={() => setBorrar(r)} ariaLabel={`Eliminar ${r.nombre}`}><Trash2 size={16} /></Boton>
                </Tarjeta>
              ))}
            </ul>
          )}
        </section>
      )}

      {editor && (
        <RoutineEditor
          inicial={editor.rutina} titulo={editor.rutina ? "Editar rutina" : "Nueva rutina"}
          etiquetaGuardar={editor.rutina ? "Guardar cambios" : "Crear rutina"} onGuardar={guardar} onCancelar={() => setEditor(null)}
        />
      )}

      {borrar && (
        <Modal titulo="Eliminar rutina" onCerrar={() => setBorrar(null)} ancho="max-w-md">
          <p className="text-white/70 text-sm mb-5">
            ¿Eliminar «{borrar.nombre}»? Tu historial de entrenamientos no se borra, pero la rutina no se podrá recuperar.
          </p>
          <div className="flex gap-2">
            <Boton variante="suave" className="flex-1" onClick={() => setBorrar(null)}>Cancelar</Boton>
            <Boton variante="peligro" className="flex-1" onClick={async () => { const r = borrar; setBorrar(null); await accion(r, () => api(`/api/fitness/rutinas/${r.id}`, { method: "DELETE" }), "Rutina eliminada"); }}>Eliminar</Boton>
          </div>
        </Modal>
      )}

      {dias && (
        <Modal titulo="¿Qué día entrenas?" onCerrar={() => setDias(null)} ancho="max-w-md">
          <div className="space-y-2">
            {agruparPorDia(dias).filter((g) => g.dia).map((g) => (
              <Boton key={g.dia} variante="suave" className="w-full justify-between" onClick={() => { const id = dias.id; setDias(null); onEntrenar(id, g.dia); }}>
                <span>{g.dia}</span><span className="text-white/40 text-xs">{g.ejercicios.length} ejercicios</span>
              </Boton>
            ))}
            <Boton variante="fantasma" className="w-full" onClick={() => { const id = dias.id; setDias(null); onEntrenar(id, null); }}>Todos los ejercicios</Boton>
          </div>
        </Modal>
      )}
    </div>
  );
}
