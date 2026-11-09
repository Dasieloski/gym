// Cálculo de métricas del módulo fitness. Funciones puras (sin acceso a BD)
// para poder probarlas y para que la definición de cada métrica viva en un solo sitio.
//
// Definiciones:
//  - Volumen de una serie = peso (kg) × repeticiones, solo en ejercicios PESO_REPS y series completadas.
//  - Volumen de sesión   = suma del volumen de sus series. Ejercicios por repeticiones o tiempo no suman.
//  - Récord PESO_MAXIMO  = mayor peso (kg) con al menos 1 repetición completada.
//  - Récord MAX_REPS     = mayor número de repeticiones en una serie (ejercicios SOLO_REPS).
//  - Récord MAX_DURACION = mayor duración (s) en una serie (ejercicios TIEMPO).
//  - Un récord solo se anuncia si ya existía un valor previo; la primera vez que se hace un
//    ejercicio queda como marca base, no como "récord".

export type TipoMedicion = 'PESO_REPS' | 'SOLO_REPS' | 'TIEMPO';
export type TipoRecord = 'PESO_MAXIMO' | 'MAX_REPS' | 'MAX_DURACION';

export interface SerieLite {
  id: number;
  numero: number;
  peso: number | null;
  repeticiones: number | null;
  duracionSeg: number | null;
  completada: boolean;
}

export interface EjercicioSesionLite {
  catalogoId: number | null;
  tipoMedicion: TipoMedicion;
  series: SerieLite[];
}

export interface RecordExistente {
  catalogoId: number;
  tipo: TipoRecord;
  valor: number;
}

export interface RecordNuevo {
  catalogoId: number;
  tipo: TipoRecord;
  valor: number;
  reps: number | null;
  serieId: number;
  previo: number | null;
  esSuperacion: boolean;
}

export const TIPO_RECORD_POR_MEDICION: Record<TipoMedicion, TipoRecord> = {
  PESO_REPS: 'PESO_MAXIMO',
  SOLO_REPS: 'MAX_REPS',
  TIEMPO: 'MAX_DURACION',
};

export function volumenSerie(tipo: TipoMedicion, s: Pick<SerieLite, 'peso' | 'repeticiones' | 'completada'>): number {
  if (tipo !== 'PESO_REPS' || !s.completada) return 0;
  if (!s.peso || !s.repeticiones || s.peso <= 0 || s.repeticiones <= 0) return 0;
  return s.peso * s.repeticiones;
}

export function volumenSesion(ejercicios: EjercicioSesionLite[]): number {
  let total = 0;
  for (const e of ejercicios) for (const s of e.series) total += volumenSerie(e.tipoMedicion, s);
  return Math.round(total * 100) / 100;
}

export function seriesCompletadas(ejercicios: EjercicioSesionLite[]): number {
  return ejercicios.reduce((acc, e) => acc + e.series.filter((s) => s.completada).length, 0);
}

function valorSerie(tipo: TipoMedicion, s: SerieLite): number | null {
  if (!s.completada) return null;
  if (tipo === 'PESO_REPS') return s.peso && s.peso > 0 && s.repeticiones && s.repeticiones >= 1 ? s.peso : null;
  if (tipo === 'SOLO_REPS') return s.repeticiones && s.repeticiones > 0 ? s.repeticiones : null;
  return s.duracionSeg && s.duracionSeg > 0 ? s.duracionSeg : null;
}

/**
 * Devuelve, por ejercicio del catálogo, la mejor marca de la sesión frente a los récords
 * existentes. `esSuperacion` es false cuando no había marca previa (marca base).
 */
export function detectarRecords(ejercicios: EjercicioSesionLite[], existentes: RecordExistente[]): RecordNuevo[] {
  const mapa = new Map<string, number>();
  for (const r of existentes) mapa.set(`${r.catalogoId}:${r.tipo}`, r.valor);

  const mejores = new Map<string, RecordNuevo>();
  for (const e of ejercicios) {
    if (e.catalogoId == null) continue; // sin catálogo no se puede agrupar el historial
    const tipo = TIPO_RECORD_POR_MEDICION[e.tipoMedicion];
    const clave = `${e.catalogoId}:${tipo}`;
    for (const s of e.series) {
      const v = valorSerie(e.tipoMedicion, s);
      if (v == null) continue;
      const actual = mejores.get(clave);
      if (!actual || v > actual.valor) {
        mejores.set(clave, {
          catalogoId: e.catalogoId, tipo, valor: v, reps: s.repeticiones, serieId: s.id,
          previo: null, esSuperacion: false,
        });
      }
    }
  }

  const resultado: RecordNuevo[] = [];
  for (const [clave, r] of Array.from(mejores.entries())) {
    const previo = mapa.get(clave) ?? null;
    if (previo != null && r.valor <= previo) continue; // no supera la marca
    resultado.push({ ...r, previo, esSuperacion: previo != null });
  }
  return resultado;
}

// ---------------------------------------------------------------------------
// Fechas y frecuencia (zona horaria del gimnasio)
// ---------------------------------------------------------------------------

export const APP_TZ = process.env.APP_TZ || 'America/Havana';

/** Fecha local "YYYY-MM-DD" de un instante en la zona indicada. */
export function claveDia(fecha: Date, tz: string = APP_TZ): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha);
}

/** Lunes (ISO) de la semana de una clave "YYYY-MM-DD". */
export function claveSemana(dia: string): string {
  const [y, m, d] = dia.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const offset = (dt.getUTCDay() + 6) % 7; // lunes = 0
  dt.setUTCDate(dt.getUTCDate() - offset);
  return dt.toISOString().slice(0, 10);
}

export function claveMes(dia: string): string {
  return dia.slice(0, 7);
}

function sumarDias(dia: string, n: number): string {
  const [y, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export interface PuntoFrecuencia { clave: string; sesiones: number }

/** Sesiones por semana en las últimas `n` semanas (incluida la actual), rellenando con 0. */
export function frecuenciaSemanal(fechas: Date[], n: number, ahora: Date = new Date(), tz: string = APP_TZ): PuntoFrecuencia[] {
  const semanaActual = claveSemana(claveDia(ahora, tz));
  const claves: string[] = [];
  for (let i = n - 1; i >= 0; i--) claves.push(sumarDias(semanaActual, -7 * i));
  const conteo = new Map(claves.map((c) => [c, 0]));
  for (const f of fechas) {
    const k = claveSemana(claveDia(f, tz));
    if (conteo.has(k)) conteo.set(k, (conteo.get(k) || 0) + 1);
  }
  return claves.map((clave) => ({ clave, sesiones: conteo.get(clave) || 0 }));
}

/** Sesiones por mes en los últimos `n` meses (incluido el actual), rellenando con 0. */
export function frecuenciaMensual(fechas: Date[], n: number, ahora: Date = new Date(), tz: string = APP_TZ): PuntoFrecuencia[] {
  const [y, m] = claveDia(ahora, tz).split('-').map(Number);
  const claves: string[] = [];
  for (let i = n - 1; i >= 0; i--) claves.push(new Date(Date.UTC(y, m - 1 - i, 1)).toISOString().slice(0, 7));
  const conteo = new Map(claves.map((c) => [c, 0]));
  for (const f of fechas) {
    const k = claveMes(claveDia(f, tz));
    if (conteo.has(k)) conteo.set(k, (conteo.get(k) || 0) + 1);
  }
  return claves.map((clave) => ({ clave, sesiones: conteo.get(clave) || 0 }));
}

/** Día de la semana en español (para emparejar con Ejercicio.diaSemana). */
export function nombreDiaSemana(fecha: Date, tz: string = APP_TZ): string {
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const [y, m, d] = claveDia(fecha, tz).split('-').map(Number);
  return dias[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
