"use client";
import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Dumbbell, Plus, Send, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMsg } from "./api";
import ExerciseCatalog from "./ExerciseCatalog";
import ProgressView from "./ProgressView";
import RoutineEditor from "./RoutineEditor";
import { agruparPorDia } from "./RoutineList";
import type { ClienteEntrenador, Rutina, RutinaInput } from "./types";
import { Boton, Chip, Cargando, ErrorEstado, Modal, VacioEstado, formatFecha } from "./ui";

type Vista = "plantillas" | "asignadas" | "clientes" | "catalogo";
const VISTAS: { id: Vista; texto: string; icono: typeof Dumbbell }[] = [
  { id: "plantillas", texto: "Plantillas", icono: ClipboardList },
  { id: "asignadas", texto: "Asignadas", icono: Send },
  { id: "clientes", texto: "Progreso", icono: Users },
  { id: "catalogo", texto: "Catálogo", icono: Dumbbell },
];

/**
 * Gestión de entrenamiento para entrenadores y administradores. Todos los permisos se aplican en el
 * servidor (/api/fitness/entrenador/*): aquí solo se muestran las acciones que cada rol puede usar.
 */
export default function GestionEntrenamiento({ rol }: { rol: "ENTRENADOR" | "ADMIN" }) {
  const [vista, setVista] = useState<Vista>("plantillas");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-2xl text-white">Entrenamiento</h2>
        <p className="text-white/50 text-sm">{rol === "ADMIN" ? "Rutinas predeterminadas, asignaciones y catálogo común." : "Crea plantillas, asígnalas a tus clientes y consulta su progreso."}</p>
      </div>
      <div role="tablist" aria-label="Secciones" className="flex gap-1.5 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5">
        {VISTAS.map((v) => (
          <button key={v.id} role="tab" aria-selected={vista === v.id} onClick={() => setVista(v.id)}
            className={`flex-1 min-h-[44px] px-3 rounded-xl text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-colors ${vista === v.id ? "bg-[#02F5D4]/15 text-[#02F5D4]" : "text-white/50 hover:text-white"}`}>
            <v.icono size={15} aria-hidden /> {v.texto}
          </button>
        ))}
      </div>
      {vista === "plantillas" && <Plantillas rol={rol} />}
      {vista === "asignadas" && <Asignadas />}
      {vista === "clientes" && <ProgresoClientes />}
      {vista === "catalogo" && <ExerciseCatalog puedeCrear />}
    </div>
  );
}

function ResumenRutina({ r }: { r: Rutina }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {agruparPorDia(r).flatMap((g) => g.ejercicios.map((e) => (
        <li key={e.id} className="flex justify-between gap-3 text-xs text-white/60">
          <span className="truncate">{g.dia ? `${g.dia.slice(0, 3)} · ` : ""}{e.nombre}</span><span className="shrink-0 tabular-nums">{e.series}×{e.catalogo?.tipoMedicion === "TIEMPO" ? `${e.duracionSeg ?? "—"} s` : e.repeticiones}</span>
        </li>
      )))}
    </ul>
  );
}

function Plantillas({ rol }: { rol: "ENTRENADOR" | "ADMIN" }) {
  const [lista, setLista] = useState<Rutina[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ r: Rutina | null } | null>(null);
  const [asignar, setAsignar] = useState<Rutina | null>(null);
  const [borrar, setBorrar] = useState<Rutina | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try { setLista(await api<Rutina[]>("/api/fitness/entrenador/plantillas")); } catch (e) { setError(errorMsg(e)); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (input: RutinaInput) => {
    if (editor?.r) await api(`/api/fitness/entrenador/plantillas/${editor.r.id}`, { method: "PUT", body: input });
    else await api("/api/fitness/entrenador/plantillas", { method: "POST", body: input });
    toast.success("Plantilla guardada");
    setEditor(null);
    cargar();
  };

  if (error) return <ErrorEstado mensaje={error} onReintentar={cargar} />;
  if (!lista) return <Cargando />;
  const puedeEditar = (r: Rutina) => rol === "ADMIN" || r.creador.rol !== "ADMIN";

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Boton onClick={() => setEditor({ r: null })}><Plus size={16} /> Nueva plantilla</Boton></div>
      {lista.length === 0 ? (
        <VacioEstado icono={<ClipboardList size={26} />} titulo="Aún no hay plantillas" texto="Crea una rutina reutilizable y asígnala a tantos clientes como quieras. Cada asignación es una copia independiente." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {lista.map((r) => (
            <li key={r.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-bold text-white">{r.nombre}</h3>
                {r.creador.rol === "ADMIN" ? <Chip color="ambar">Predeterminada</Chip> : <Chip color="cian">Mía</Chip>}
              </div>
              {r.descripcion && <p className="text-white/50 text-sm mt-1 line-clamp-2">{r.descripcion}</p>}
              <ResumenRutina r={r} />
              <div className="flex flex-wrap gap-2 mt-4">
                <Boton onClick={() => setAsignar(r)}><Send size={15} /> Asignar</Boton>
                {puedeEditar(r) && <Boton variante="suave" onClick={() => setEditor({ r })}>Editar</Boton>}
                {puedeEditar(r) && <Boton variante="peligro" onClick={() => setBorrar(r)} ariaLabel={`Eliminar ${r.nombre}`}><Trash2 size={15} /></Boton>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {editor && <RoutineEditor inicial={editor.r} titulo={editor.r ? "Editar plantilla" : "Nueva plantilla"} etiquetaGuardar="Guardar plantilla" onGuardar={guardar} onCancelar={() => setEditor(null)} />}
      {asignar && <AsignarModal rutina={asignar} onCerrar={() => setAsignar(null)} />}
      {borrar && (
        <Modal titulo="Eliminar plantilla" onCerrar={() => setBorrar(null)} ancho="max-w-md">
          <p className="text-white/70 text-sm mb-5">¿Eliminar «{borrar.nombre}»? Las rutinas ya asignadas a clientes no se ven afectadas.</p>
          <div className="flex gap-2">
            <Boton variante="suave" className="flex-1" onClick={() => setBorrar(null)}>Cancelar</Boton>
            <Boton variante="peligro" className="flex-1" onClick={async () => {
              const r = borrar; setBorrar(null);
              try { await api(`/api/fitness/entrenador/plantillas/${r.id}`, { method: "DELETE" }); toast.success("Plantilla eliminada"); cargar(); } catch (e) { toast.error(errorMsg(e)); }
            }}>Eliminar</Boton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function useClientes() {
  const [clientes, setClientes] = useState<ClienteEntrenador[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cargar = useCallback(async () => {
    setError(null);
    try { setClientes(await api<ClienteEntrenador[]>("/api/fitness/entrenador/clientes")); } catch (e) { setError(errorMsg(e)); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);
  return { clientes, error, cargar };
}

function AsignarModal({ rutina, onCerrar }: { rutina: Rutina; onCerrar: () => void }) {
  const { clientes, error, cargar } = useClientes();
  const [sel, setSel] = useState<number[]>([]);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setEnviando(true);
    let ok = 0;
    for (const clienteId of sel) {
      try { await api("/api/fitness/entrenador/asignaciones", { method: "POST", body: { rutinaId: rutina.id, clienteId } }); ok++; } catch (e) { toast.error(errorMsg(e)); }
    }
    setEnviando(false);
    if (ok) { toast.success(`Rutina asignada a ${ok} cliente${ok === 1 ? "" : "s"}`); onCerrar(); }
  };

  return (
    <Modal titulo={`Asignar «${rutina.nombre}»`} onCerrar={onCerrar} ancho="max-w-md">
      {error ? <ErrorEstado mensaje={error} onReintentar={cargar} /> : !clientes ? <Cargando /> : clientes.length === 0 ? (
        <p className="text-sm text-white/50 text-center py-6">No tienes clientes asignados.</p>
      ) : (
        <fieldset className="space-y-1.5">
          <legend className="text-xs text-white/50 mb-2">Se creará una copia para cada cliente seleccionado.</legend>
          {clientes.map((c) => (
            <label key={c.id} className="flex items-center gap-3 min-h-[48px] rounded-xl border border-white/10 px-3 cursor-pointer hover:border-white/25">
              <input type="checkbox" checked={sel.includes(c.id)} onChange={(e) => setSel(e.target.checked ? [...sel, c.id] : sel.filter((x) => x !== c.id))} className="w-4 h-4 accent-[#02F5D4]" />
              <span className="text-sm text-white">{c.nombre}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex gap-2 mt-5">
        <Boton variante="suave" className="flex-1" onClick={onCerrar}>Cancelar</Boton>
        <Boton className="flex-1" disabled={sel.length === 0 || enviando} onClick={enviar}>{enviando ? "Asignando…" : `Asignar (${sel.length})`}</Boton>
      </div>
    </Modal>
  );
}

function Asignadas() {
  const [lista, setLista] = useState<Rutina[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Rutina | null>(null);
  const [retirar, setRetirar] = useState<Rutina | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try { setLista(await api<Rutina[]>("/api/fitness/entrenador/asignaciones")); } catch (e) { setError(errorMsg(e)); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  if (error) return <ErrorEstado mensaje={error} onReintentar={cargar} />;
  if (!lista) return <Cargando />;
  if (lista.length === 0) return <VacioEstado icono={<Send size={26} />} titulo="Sin asignaciones" texto="Asigna una plantilla desde la pestaña Plantillas y aparecerá aquí." />;

  return (
    <>
      <ul className="grid gap-3 md:grid-cols-2">
        {lista.map((r) => (
          <li key={r.id} className={`rounded-2xl border p-4 ${r.activa ? "border-white/[0.08] bg-white/[0.03]" : "border-white/[0.05] bg-white/[0.01] opacity-60"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><h3 className="font-heading font-bold text-white truncate">{r.nombre}</h3><p className="text-xs text-white/45">Para {r.cliente.nombre} · {formatFecha(r.updatedAt)}</p></div>
              <Chip color={r.activa ? "verde" : "neutro"}>{r.activa ? "Activa" : "Retirada"}</Chip>
            </div>
            <ResumenRutina r={r} />
            {r.activa && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Boton variante="suave" onClick={() => setEditor(r)}>Editar</Boton>
                <Boton variante="peligro" onClick={() => setRetirar(r)}>Retirar</Boton>
              </div>
            )}
          </li>
        ))}
      </ul>
      {editor && <RoutineEditor inicial={editor} titulo={`Editar rutina de ${editor.cliente.nombre}`} etiquetaGuardar="Guardar cambios" onCancelar={() => setEditor(null)}
        onGuardar={async (input) => { await api(`/api/fitness/entrenador/asignaciones/${editor.id}`, { method: "PUT", body: input }); toast.success("Rutina actualizada"); setEditor(null); cargar(); }} />}
      {retirar && (
        <Modal titulo="Retirar rutina" onCerrar={() => setRetirar(null)} ancho="max-w-md">
          <p className="text-white/70 text-sm mb-5">«{retirar.nombre}» dejará de aparecer a {retirar.cliente.nombre}. Su historial de entrenamientos se conserva.</p>
          <div className="flex gap-2">
            <Boton variante="suave" className="flex-1" onClick={() => setRetirar(null)}>Cancelar</Boton>
            <Boton variante="peligro" className="flex-1" onClick={async () => {
              const r = retirar; setRetirar(null);
              try { await api(`/api/fitness/entrenador/asignaciones/${r.id}`, { method: "DELETE" }); toast.success("Rutina retirada"); cargar(); } catch (e) { toast.error(errorMsg(e)); }
            }}>Retirar</Boton>
          </div>
        </Modal>
      )}
    </>
  );
}

function ProgresoClientes() {
  const { clientes, error, cargar } = useClientes();
  const [sel, setSel] = useState<ClienteEntrenador | null>(null);

  if (error) return <ErrorEstado mensaje={error} onReintentar={cargar} />;
  if (!clientes) return <Cargando />;
  if (clientes.length === 0) return <VacioEstado icono={<Users size={26} />} titulo="Sin clientes" texto="Cuando tengas clientes asignados podrás consultar aquí su historial y progreso." />;

  if (sel) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading font-bold text-xl text-white truncate">{sel.nombre}</h3>
          <Boton variante="suave" onClick={() => setSel(null)}>← Clientes</Boton>
        </div>
        <ProgressView clienteId={sel.id} />
      </div>
    );
  }
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {clientes.map((c) => (
        <li key={c.id}>
          <button onClick={() => setSel(c)} className="w-full text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-[#02F5D4]/30 p-4 min-h-[72px] transition-colors">
            <p className="font-heading font-bold text-white">{c.nombre}</p>
            <p className="text-xs text-white/45 mt-1">{c.sesionesTotales === 0 ? "Aún no ha entrenado" : `${c.sesiones30d} entrenos en 30 días · último ${formatFecha(c.ultimaSesion)}`}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
