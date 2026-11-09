"use client";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { CATEGORIAS, EQUIPAMIENTOS, MUSCULOS, NIVELES, TIPOS_MEDICION } from "@/lib/fitness/constants";
import { api, errorMsg } from "./api";
import { Boton, Modal, etiqueta } from "./ui";

const campo = "w-full min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#02F5D4]/50";

function Opciones({ valores }: { valores: readonly string[] }) {
  return <>{valores.map((v) => <option key={v} value={v} className="bg-[#0a0a0a]">{etiqueta(v)}</option>)}</>;
}

/** Alta de un ejercicio en el catálogo común (entrenadores y administradores). */
export default function ExerciseForm({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: () => void }) {
  const [f, setF] = useState({
    nombre: "", descripcion: "", instrucciones: "", musculoPrincipal: "PECHO", equipamiento: "MANCUERNAS",
    categoria: "FUERZA", nivel: "PRINCIPIANTE", tipoMedicion: "PESO_REPS", mediaUrl: "", mediaLicencia: "",
  });
  const [guardando, setGuardando] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setGuardando(true);
    try {
      await api("/api/fitness/catalogo", {
        method: "POST",
        body: {
          ...f,
          descripcion: f.descripcion.trim() || null,
          instrucciones: f.instrucciones.split("\n").map((l) => l.trim()).filter(Boolean),
          mediaUrl: f.mediaUrl.trim() || null,
          mediaLicencia: f.mediaLicencia.trim() || null,
        },
      });
      toast.success("Ejercicio añadido al catálogo");
      onCreado();
    } catch (e) {
      toast.error(errorMsg(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Nuevo ejercicio" onCerrar={onCerrar}>
      <form onSubmit={enviar} className="space-y-3">
        <label className="block"><span className="text-xs text-white/50">Nombre</span>
          <input required minLength={2} maxLength={120} value={f.nombre} onChange={set("nombre")} className={campo} /></label>
        <label className="block"><span className="text-xs text-white/50">Descripción (opcional)</span>
          <textarea maxLength={1000} rows={2} value={f.descripcion} onChange={set("descripcion")} className={campo + " py-2"} /></label>
        <label className="block"><span className="text-xs text-white/50">Instrucciones (un paso por línea)</span>
          <textarea rows={4} value={f.instrucciones} onChange={set("instrucciones")} className={campo + " py-2"} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs text-white/50">Músculo principal</span>
            <select value={f.musculoPrincipal} onChange={set("musculoPrincipal")} className={campo}><Opciones valores={MUSCULOS} /></select></label>
          <label className="block"><span className="text-xs text-white/50">Equipamiento</span>
            <select value={f.equipamiento} onChange={set("equipamiento")} className={campo}><Opciones valores={EQUIPAMIENTOS} /></select></label>
          <label className="block"><span className="text-xs text-white/50">Categoría</span>
            <select value={f.categoria} onChange={set("categoria")} className={campo}><Opciones valores={CATEGORIAS} /></select></label>
          <label className="block"><span className="text-xs text-white/50">Nivel</span>
            <select value={f.nivel} onChange={set("nivel")} className={campo}><Opciones valores={NIVELES} /></select></label>
        </div>
        <label className="block"><span className="text-xs text-white/50">Cómo se mide</span>
          <select value={f.tipoMedicion} onChange={set("tipoMedicion")} className={campo}><Opciones valores={TIPOS_MEDICION} /></select></label>
        <fieldset className="rounded-xl border border-white/10 p-3 space-y-2">
          <legend className="px-1 text-xs text-white/50">Imagen o vídeo (opcional)</legend>
          <input type="url" placeholder="https://… (solo recursos propios o con licencia de uso)" value={f.mediaUrl} onChange={set("mediaUrl")} className={campo} aria-label="URL del recurso" />
          <input placeholder="Licencia o autoría (obligatoria si hay URL)" required={!!f.mediaUrl} value={f.mediaLicencia} onChange={set("mediaLicencia")} className={campo} aria-label="Licencia del recurso" />
        </fieldset>
        <div className="flex gap-2 pt-2">
          <Boton variante="suave" onClick={onCerrar} className="flex-1">Cancelar</Boton>
          <Boton type="submit" disabled={guardando} className="flex-1">{guardando ? "Guardando…" : "Guardar ejercicio"}</Boton>
        </div>
      </form>
    </Modal>
  );
}
