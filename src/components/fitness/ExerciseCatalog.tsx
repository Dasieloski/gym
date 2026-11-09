"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dumbbell, Plus, Search } from "lucide-react";
import { CATEGORIAS, EQUIPAMIENTOS, MUSCULOS, NIVELES } from "@/lib/fitness/constants";
import { api, errorMsg } from "./api";
import type { CatalogoEjercicio } from "./types";
import { Boton, Cargando, Chip, ErrorEstado, Modal, VacioEstado, etiqueta } from "./ui";
import ExerciseForm from "./ExerciseForm";

interface Props {
  /** "elegir" muestra un botón para añadir el ejercicio a una rutina. */
  modo?: "explorar" | "elegir";
  onElegir?: (e: CatalogoEjercicio) => void;
  /** Entrenadores y administradores pueden ampliar el catálogo común. */
  puedeCrear?: boolean;
}

interface Respuesta { total: number; items: CatalogoEjercicio[]; tamanoPagina: number }

function Selector({ etiquetaCampo, valor, onCambio, opciones }: { etiquetaCampo: string; valor: string; onCambio: (v: string) => void; opciones: readonly string[] }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{etiquetaCampo}</span>
      <select
        value={valor} onChange={(e) => onCambio(e.target.value)} aria-label={etiquetaCampo}
        className="w-full min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#02F5D4]/50"
      >
        <option value="" className="bg-[#0a0a0a]">{etiquetaCampo}: todos</option>
        {opciones.map((o) => <option key={o} value={o} className="bg-[#0a0a0a]">{etiqueta(o)}</option>)}
      </select>
    </label>
  );
}

export default function ExerciseCatalog({ modo = "explorar", onElegir, puedeCrear }: Props) {
  const [q, setQ] = useState("");
  const [filtros, setFiltros] = useState({ musculo: "", equipamiento: "", categoria: "", nivel: "" });
  const [items, setItems] = useState<CatalogoEjercicio[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<CatalogoEjercicio | null>(null);
  const [creando, setCreando] = useState(false);
  const peticion = useRef(0);

  const cargar = useCallback(async (nuevaPagina: number, reemplazar: boolean) => {
    const id = ++peticion.current;
    setCargando(true);
    setError(null);
    try {
      const p = new URLSearchParams({ pagina: String(nuevaPagina) });
      if (q.trim()) p.set("q", q.trim());
      Object.entries(filtros).forEach(([k, v]) => v && p.set(k, v));
      const r = await api<Respuesta>(`/api/fitness/catalogo?${p}`);
      if (id !== peticion.current) return; // respuesta obsoleta
      setItems((prev) => (reemplazar ? r.items : [...prev, ...r.items]));
      setTotal(r.total);
      setPagina(nuevaPagina);
    } catch (e) {
      if (id === peticion.current) setError(errorMsg(e));
    } finally {
      if (id === peticion.current) setCargando(false);
    }
  }, [q, filtros]);

  // Búsqueda con pequeña espera para no lanzar una petición por cada tecla.
  useEffect(() => {
    const t = setTimeout(() => cargar(1, true), 250);
    return () => clearTimeout(t);
  }, [cargar]);

  const hayFiltros = q || Object.values(filtros).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} aria-hidden />
            <input
              type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio por nombre" aria-label="Buscar ejercicio por nombre"
              className="w-full min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#02F5D4]/50"
            />
          </div>
          {puedeCrear && <Boton variante="suave" onClick={() => setCreando(true)} ariaLabel="Crear ejercicio"><Plus size={16} /> <span className="hidden sm:inline">Nuevo</span></Boton>}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Selector etiquetaCampo="Músculo" valor={filtros.musculo} onCambio={(v) => setFiltros({ ...filtros, musculo: v })} opciones={MUSCULOS} />
          <Selector etiquetaCampo="Equipamiento" valor={filtros.equipamiento} onCambio={(v) => setFiltros({ ...filtros, equipamiento: v })} opciones={EQUIPAMIENTOS} />
          <Selector etiquetaCampo="Categoría" valor={filtros.categoria} onCambio={(v) => setFiltros({ ...filtros, categoria: v })} opciones={CATEGORIAS} />
          <Selector etiquetaCampo="Nivel" valor={filtros.nivel} onCambio={(v) => setFiltros({ ...filtros, nivel: v })} opciones={NIVELES} />
        </div>
        <p className="text-xs text-white/40" aria-live="polite">{cargando && items.length === 0 ? "Buscando…" : `${total} ejercicio${total === 1 ? "" : "s"}`}</p>
      </div>

      {error ? (
        <ErrorEstado mensaje={error} onReintentar={() => cargar(1, true)} />
      ) : cargando && items.length === 0 ? (
        <Cargando />
      ) : items.length === 0 ? (
        <VacioEstado
          icono={<Dumbbell size={26} />} titulo={hayFiltros ? "Sin resultados" : "El catálogo está vacío"}
          texto={hayFiltros ? "Prueba con otro nombre o quita algún filtro." : "Aún no hay ejercicios disponibles. Tu gimnasio puede cargarlos desde el panel."}
          accion={hayFiltros ? <Boton variante="suave" onClick={() => { setQ(""); setFiltros({ musculo: "", equipamiento: "", categoria: "", nivel: "" }); }}>Quitar filtros</Boton> : undefined}
        />
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((e) => (
            <li key={e.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex flex-col gap-3">
              <button onClick={() => setDetalle(e)} className="text-left min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#02F5D4] rounded-lg">
                <h3 className="font-heading font-bold text-white leading-snug">{e.nombre}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Chip color="cian">{etiqueta(e.musculoPrincipal)}</Chip>
                  <Chip>{etiqueta(e.equipamiento)}</Chip>
                  <Chip color="azul">{etiqueta(e.nivel)}</Chip>
                </div>
              </button>
              {modo === "elegir" && onElegir && (
                <Boton onClick={() => onElegir(e)} ariaLabel={`Añadir ${e.nombre} a la rutina`}><Plus size={16} /> Añadir</Boton>
              )}
            </li>
          ))}
        </ul>
      )}

      {items.length < total && !error && (
        <div className="text-center"><Boton variante="suave" disabled={cargando} onClick={() => cargar(pagina + 1, false)}>{cargando ? "Cargando…" : "Cargar más"}</Boton></div>
      )}

      {detalle && (
        <Modal titulo={detalle.nombre} onCerrar={() => setDetalle(null)}>
          <DetalleEjercicio e={detalle} />
          {modo === "elegir" && onElegir && (
            <div className="mt-5"><Boton grande className="w-full" onClick={() => { onElegir(detalle); setDetalle(null); }}><Plus size={18} /> Añadir a la rutina</Boton></div>
          )}
        </Modal>
      )}
      {creando && <ExerciseForm onCerrar={() => setCreando(false)} onCreado={() => { setCreando(false); cargar(1, true); }} />}
    </div>
  );
}

export function DetalleEjercicio({ e }: { e: Pick<CatalogoEjercicio, "descripcion" | "instrucciones" | "musculoPrincipal" | "mediaUrl"> & Partial<CatalogoEjercicio> }) {
  const esVideo = !!e.mediaUrl && /\.(mp4|webm)(\?|$)/i.test(e.mediaUrl);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <Chip color="cian">{etiqueta(e.musculoPrincipal)}</Chip>
        {e.musculosSecundarios?.map((m) => <Chip key={m}>{etiqueta(m)}</Chip>)}
        {e.equipamiento && <Chip color="azul">{etiqueta(e.equipamiento)}</Chip>}
        {e.nivel && <Chip>{etiqueta(e.nivel)}</Chip>}
        {e.categoria && <Chip>{etiqueta(e.categoria)}</Chip>}
        {e.tipoMedicion && <Chip color="ambar">{etiqueta(e.tipoMedicion)}</Chip>}
      </div>
      {e.mediaUrl && (
        <figure className="rounded-2xl overflow-hidden border border-white/10 bg-black">
          {esVideo ? (
            <video src={e.mediaUrl} controls muted loop playsInline className="w-full max-h-72" aria-label="Demostración del ejercicio" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.mediaUrl} alt={`Demostración de ${e.nombre ?? "el ejercicio"}`} className="w-full max-h-72 object-contain" loading="lazy" />
          )}
          {e.mediaLicencia && <figcaption className="px-3 py-1.5 text-[11px] text-white/40">Licencia: {e.mediaLicencia}</figcaption>}
        </figure>
      )}
      {e.descripcion && <p className="text-white/70 text-sm leading-relaxed">{e.descripcion}</p>}
      {e.instrucciones.length > 0 && (
        <div>
          <h4 className="font-heading font-bold text-white text-sm mb-2">Cómo se hace</h4>
          <ol className="space-y-2">
            {e.instrucciones.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/70">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#02F5D4]/10 text-[#02F5D4] text-xs font-bold flex items-center justify-center" aria-hidden>{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
