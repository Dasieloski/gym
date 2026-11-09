// Tipos del módulo fitness tal y como los devuelve la API (/api/fitness/*).

export type TipoMedicion = 'PESO_REPS' | 'SOLO_REPS' | 'TIEMPO';
export type RutinaTipo = 'PERSONAL' | 'ASIGNADA' | 'PLANTILLA';

export interface CatalogoEjercicio {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
  instrucciones: string[];
  musculoPrincipal: string;
  musculosSecundarios: string[];
  equipamiento: string;
  categoria: string;
  nivel: string;
  tipoMedicion: TipoMedicion;
  mediaUrl: string | null;
  mediaLicencia: string | null;
}

export interface EjercicioRutina {
  id: number;
  catalogoId: number | null;
  nombre: string;
  series: number;
  repeticiones: number;
  peso: number | null;
  duracionSeg: number | null;
  descansoSeg: number | null;
  diaSemana: string | null;
  notas: string | null;
  orden: number;
  catalogo: Pick<CatalogoEjercicio, 'id' | 'nombre' | 'musculoPrincipal' | 'equipamiento' | 'tipoMedicion' | 'mediaUrl'> | null;
}

export interface Rutina {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: RutinaTipo;
  activa: boolean;
  clienteId: number;
  creadorId: number;
  plantillaOrigenId: number | null;
  updatedAt: string;
  ejercicios: EjercicioRutina[];
  creador: { id: number; nombre: string; rol: string };
  cliente: { id: number; nombre: string };
}

/** Línea editable de una rutina (lo que envía el editor a la API). */
export interface LineaEditor {
  clave: string; // id local para listas y reordenación
  catalogo: CatalogoEjercicio | Pick<CatalogoEjercicio, 'id' | 'nombre' | 'musculoPrincipal' | 'equipamiento' | 'tipoMedicion' | 'mediaUrl'>;
  series: number;
  repeticiones: number;
  peso: number | null;
  duracionSeg: number | null;
  descansoSeg: number | null;
  diaSemana: string | null;
  notas: string | null;
}

export interface RutinaInput {
  nombre: string;
  descripcion: string | null;
  ejercicios: {
    catalogoId: number;
    series: number;
    repeticiones: number;
    peso: number | null;
    duracionSeg: number | null;
    descansoSeg: number | null;
    diaSemana: string | null;
    notas: string | null;
  }[];
}

export interface Serie {
  id: number;
  numero: number;
  peso: number | null;
  repeticiones: number | null;
  duracionSeg: number | null;
  completada: boolean;
  esRecord: boolean;
}

export interface EjercicioSesion {
  id: number;
  orden: number;
  catalogoId: number | null;
  nombre: string;
  tipoMedicion: TipoMedicion;
  seriesObjetivo: number;
  repsObjetivo: number | null;
  pesoObjetivo: number | null;
  duracionObjetivoSeg: number | null;
  descansoSeg: number | null;
  notas: string | null;
  series: Serie[];
  catalogo: { id: number; musculoPrincipal: string; equipamiento: string; instrucciones: string[]; mediaUrl: string | null } | null;
}

export interface Sesion {
  id: number;
  rutinaNombre: string;
  estado: 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';
  iniciadaAt: string;
  ejercicios: EjercicioSesion[];
}

export interface ResumenSesion {
  id: number;
  rutinaNombre: string;
  duracionSeg: number | null;
  totalSeries: number;
  volumenKg: number;
  ejerciciosRealizados: number;
  totalEjercicios: number;
  records: { ejercicio: string; tipo: string; valor: number | null; reps: number | null }[];
}

export interface FilaHistorial {
  id: number;
  rutinaNombre: string;
  finalizadaAt: string;
  duracionSeg: number | null;
  totalSeries: number | null;
  volumenKg: number | null;
  totalEjercicios: number;
  records: number;
}

export interface Punto { clave: string; sesiones: number }

export interface Progreso {
  totales: { sesiones: number; series: number; volumenKg: number; duracionSeg: number };
  frecuenciaSemanal: Punto[];
  frecuenciaMensual: Punto[];
  records: { id: number; catalogoId: number; ejercicio: string; musculo: string; tipo: string; valor: number; reps: number | null; fecha: string }[];
  ejercicios: { id: number; nombre: string; tipoMedicion: TipoMedicion }[];
  historial?: FilaHistorial[];
}

export interface Evolucion {
  ejercicio: { id: number; nombre: string; tipoMedicion: TipoMedicion };
  unidad: 'kg' | 'reps' | 's';
  puntos: { sesionId: number; fecha: string; valor: number; volumen: number }[];
}

export interface Inicio {
  nombre: string;
  membresia: { tipo: string; fechaFin: string; diasRestantes: number | null; estado: string; congelada: boolean; estadoPago: string } | null;
  estadoMembresia: 'SIN_MEMBRESIA' | 'CONGELADA' | 'VENCIDA' | 'POR_VENCER' | 'ACTIVA';
  entrenador: { nombre: string; telefono: string } | null;
  hoy: { dia: string; rutinas: { id: number; nombre: string; tipo: RutinaTipo; diaSemana: string; ejercicios: number }[] };
  sesionActiva: { id: number; rutinaNombre: string; iniciadaAt: string } | null;
  totalRutinas: number;
  semana: { sesiones: number; series: number; volumenKg: number; duracionSeg: number };
  ultimasSesiones: { id: number; rutinaNombre: string; finalizadaAt: string; duracionSeg: number | null; totalSeries: number | null; volumenKg: number | null }[];
  records: { id: number; ejercicio: string; tipo: string; valor: number; fecha: string }[];
  avisos: { id: number; titulo: string; mensaje: string; tipo: string; createdAt: string }[];
  asistenciasMes: number;
  proximaReserva: { id: number; fecha: string } | null;
}

export interface ClienteEntrenador {
  id: number;
  nombre: string;
  sesionesTotales: number;
  sesiones30d: number;
  ultimaSesion: string | null;
}
