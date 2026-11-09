import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { HttpError } from './auth';
import { MAX_SERIES_POR_EJERCICIO } from './constants';
import {
  EjercicioSesionLite, RecordExistente, TipoMedicion, TIPO_RECORD_POR_MEDICION,
  detectarRecords, seriesCompletadas, volumenSesion,
} from './metrics';
import type { SerieInput } from './validation';

const HORAS_ABANDONO = 24; // una sesión en curso más antigua se considera abandonada

export const includeSesion = {
  ejercicios: {
    orderBy: { orden: 'asc' },
    include: {
      series: { orderBy: { numero: 'asc' } },
      catalogo: {
        select: { id: true, musculoPrincipal: true, equipamiento: true, instrucciones: true, mediaUrl: true },
      },
    },
  },
} satisfies Prisma.SesionEntrenamientoInclude;

export type SesionCompleta = Prisma.SesionEntrenamientoGetPayload<{ include: typeof includeSesion }>;

function tipoLegacy(e: { duracionSeg: number | null }): TipoMedicion {
  return e.duracionSeg ? 'TIEMPO' : 'PESO_REPS';
}

export async function sesionActiva(userId: number): Promise<SesionCompleta | null> {
  return prisma.sesionEntrenamiento.findFirst({
    where: { usuarioId: userId, estado: 'EN_CURSO' },
    include: includeSesion,
  });
}

/**
 * Inicia una sesión copiando (snapshot) los ejercicios de la rutina, de modo que editar o borrar
 * la rutina después no altere el historial. Es idempotente por `claveCliente`: un reintento de red
 * devuelve la misma sesión en lugar de crear otra.
 */
export async function iniciarSesion(
  userId: number,
  datos: { rutinaId: number; claveCliente: string; diaSemana?: string | null },
): Promise<{ sesion: SesionCompleta; creada: boolean }> {
  const repetida = await prisma.sesionEntrenamiento.findUnique({
    where: { usuarioId_claveCliente: { usuarioId: userId, claveCliente: datos.claveCliente } },
    include: includeSesion,
  });
  if (repetida) return { sesion: repetida, creada: false };

  const activa = await sesionActiva(userId);
  if (activa) {
    const horas = (Date.now() - activa.iniciadaAt.getTime()) / 3_600_000;
    if (horas < HORAS_ABANDONO) {
      throw Object.assign(new HttpError(409, 'Ya tienes un entrenamiento en curso'), { sesionActivaId: activa.id });
    }
    await prisma.sesionEntrenamiento.update({ where: { id: activa.id }, data: { estado: 'CANCELADA' } });
  }

  const rutina = await prisma.rutina.findFirst({
    where: { id: datos.rutinaId, clienteId: userId, activa: true, tipo: { in: ['PERSONAL', 'ASIGNADA'] } },
    include: {
      ejercicios: { orderBy: { orden: 'asc' }, include: { catalogo: { select: { tipoMedicion: true } } } },
    },
  });
  if (!rutina) throw new HttpError(404, 'Rutina no encontrada');

  // Si se entrena un día concreto, solo entran los ejercicios de ese día y los que no tienen día.
  const ejercicios = rutina.ejercicios.filter(
    (e) => !datos.diaSemana || !e.diaSemana || e.diaSemana === datos.diaSemana,
  );
  if (ejercicios.length === 0) throw new HttpError(400, 'La rutina no tiene ejercicios para ese día');

  try {
    const sesion = await prisma.sesionEntrenamiento.create({
      data: {
        usuarioId: userId,
        rutinaId: rutina.id,
        rutinaNombre: rutina.nombre,
        diaSemana: datos.diaSemana ?? null,
        claveCliente: datos.claveCliente,
        ejercicios: {
          create: ejercicios.map((e, i) => ({
            orden: i,
            catalogoId: e.catalogoId,
            nombre: e.nombre,
            tipoMedicion: e.catalogo?.tipoMedicion ?? tipoLegacy(e),
            seriesObjetivo: e.series,
            repsObjetivo: e.repeticiones,
            pesoObjetivo: e.peso,
            duracionObjetivoSeg: e.duracionSeg,
            descansoSeg: e.descansoSeg,
            notas: e.notas,
          })),
        },
      },
      include: includeSesion,
    });
    return { sesion, creada: true };
  } catch (e) {
    // Carrera entre dos peticiones: el índice único parcial impide dos sesiones EN_CURSO.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const otra =
        (await prisma.sesionEntrenamiento.findUnique({
          where: { usuarioId_claveCliente: { usuarioId: userId, claveCliente: datos.claveCliente } },
          include: includeSesion,
        })) ?? (await sesionActiva(userId));
      if (otra) {
        if (otra.claveCliente === datos.claveCliente) return { sesion: otra, creada: false };
        throw Object.assign(new HttpError(409, 'Ya tienes un entrenamiento en curso'), { sesionActivaId: otra.id });
      }
    }
    throw e;
  }
}

export async function obtenerSesion(userId: number, id: number): Promise<SesionCompleta> {
  const s = await prisma.sesionEntrenamiento.findFirst({ where: { id, usuarioId: userId }, include: includeSesion });
  if (!s) throw new HttpError(404, 'Sesión no encontrada');
  return s;
}

/** Guarda (upsert) una serie. Repetir la misma petición no duplica nada: la clave es (ejercicio, número). */
export async function guardarSerie(userId: number, sesionId: number, d: SerieInput) {
  const ejercicio = await prisma.sesionEjercicio.findFirst({
    where: { id: d.ejercicioId, sesionId, sesion: { usuarioId: userId } },
    include: { sesion: { select: { estado: true } } },
  });
  if (!ejercicio) throw new HttpError(404, 'Ejercicio no encontrado');
  if (ejercicio.sesion.estado !== 'EN_CURSO') throw new HttpError(409, 'La sesión ya no está en curso');
  if (d.numero > Math.max(ejercicio.seriesObjetivo + 5, MAX_SERIES_POR_EJERCICIO)) throw new HttpError(400, 'Número de serie inválido');

  if (d.completada) {
    const ok =
      ejercicio.tipoMedicion === 'TIEMPO' ? (d.duracionSeg ?? 0) >= 1 : (d.repeticiones ?? 0) >= 1;
    if (!ok) {
      throw new HttpError(400, ejercicio.tipoMedicion === 'TIEMPO' ? 'Indica la duración de la serie' : 'Indica las repeticiones de la serie');
    }
  }

  const previa = await prisma.serieRegistrada.findUnique({
    where: { sesionEjercicioId_numero: { sesionEjercicioId: ejercicio.id, numero: d.numero } },
    select: { completadaAt: true },
  });
  const datos = {
    peso: ejercicio.tipoMedicion === 'PESO_REPS' ? d.peso ?? null : null,
    repeticiones: ejercicio.tipoMedicion === 'TIEMPO' ? null : d.repeticiones ?? null,
    duracionSeg: ejercicio.tipoMedicion === 'TIEMPO' ? d.duracionSeg ?? null : null,
    completada: d.completada,
    completadaAt: d.completada ? previa?.completadaAt ?? new Date() : null,
  };
  return prisma.serieRegistrada.upsert({
    where: { sesionEjercicioId_numero: { sesionEjercicioId: ejercicio.id, numero: d.numero } },
    create: { sesionEjercicioId: ejercicio.id, numero: d.numero, ...datos },
    update: datos,
  });
}

function aLite(s: SesionCompleta): EjercicioSesionLite[] {
  return s.ejercicios.map((e) => ({
    catalogoId: e.catalogoId,
    tipoMedicion: e.tipoMedicion,
    series: e.series.map((x) => ({
      id: x.id, numero: x.numero, peso: x.peso, repeticiones: x.repeticiones,
      duracionSeg: x.duracionSeg, completada: x.completada,
    })),
  }));
}

export async function finalizarSesion(userId: number, id: number, notas?: string | null) {
  const sesion = await obtenerSesion(userId, id);
  if (sesion.estado === 'COMPLETADA') return resumenSesion(sesion); // reintento: mismo resultado
  if (sesion.estado === 'CANCELADA') throw new HttpError(409, 'La sesión fue cancelada');

  const lite = aLite(sesion);
  const completadas = seriesCompletadas(lite);
  if (completadas === 0) throw new HttpError(400, 'Registra al menos una serie o cancela el entrenamiento');

  const catalogoIds = Array.from(new Set(sesion.ejercicios.map((e) => e.catalogoId).filter((x): x is number => x != null)));
  const finalizadaAt = new Date();

  await prisma.$transaction(async (tx) => {
    // Cierra la sesión solo si sigue en curso: dos finalizaciones simultáneas no duplican récords.
    const cerrada = await tx.sesionEntrenamiento.updateMany({
      where: { id, usuarioId: userId, estado: 'EN_CURSO' },
      data: {
        estado: 'COMPLETADA',
        finalizadaAt,
        duracionSeg: Math.max(1, Math.round((finalizadaAt.getTime() - sesion.iniciadaAt.getTime()) / 1000)),
        totalSeries: completadas,
        volumenKg: volumenSesion(lite),
        notas: notas ?? null,
      },
    });
    if (cerrada.count === 0) return;

    const existentes = await tx.recordPersonal.findMany({
      where: { usuarioId: userId, catalogoId: { in: catalogoIds } },
      select: { catalogoId: true, tipo: true, valor: true },
    });
    const nuevos = detectarRecords(lite, existentes as RecordExistente[]);
    for (const r of nuevos) {
      await tx.recordPersonal.upsert({
        where: { usuarioId_catalogoId_tipo: { usuarioId: userId, catalogoId: r.catalogoId, tipo: r.tipo } },
        create: { usuarioId: userId, catalogoId: r.catalogoId, tipo: r.tipo, valor: r.valor, reps: r.reps, sesionId: id, logradoAt: finalizadaAt },
        update: { valor: r.valor, reps: r.reps, sesionId: id, logradoAt: finalizadaAt },
      });
      if (r.esSuperacion) await tx.serieRegistrada.update({ where: { id: r.serieId }, data: { esRecord: true } });
    }
  });

  return resumenSesion(await obtenerSesion(userId, id));
}

export async function cancelarSesion(userId: number, id: number) {
  const sesion = await obtenerSesion(userId, id);
  if (sesion.estado === 'CANCELADA') return { id, estado: 'CANCELADA' as const };
  if (sesion.estado === 'COMPLETADA') throw new HttpError(409, 'La sesión ya fue completada');
  await prisma.sesionEntrenamiento.updateMany({ where: { id, usuarioId: userId, estado: 'EN_CURSO' }, data: { estado: 'CANCELADA' } });
  return { id, estado: 'CANCELADA' as const };
}

/** Resumen calculado siempre a partir de lo guardado, así es idéntico al reabrirlo. */
export function resumenSesion(s: SesionCompleta) {
  const lite = aLite(s);
  const records = s.ejercicios.flatMap((e) =>
    e.series
      .filter((x) => x.esRecord)
      .map((x) => ({
        ejercicio: e.nombre,
        tipo: TIPO_RECORD_POR_MEDICION[e.tipoMedicion],
        valor: e.tipoMedicion === 'PESO_REPS' ? x.peso : e.tipoMedicion === 'SOLO_REPS' ? x.repeticiones : x.duracionSeg,
        reps: x.repeticiones,
      })),
  );
  return {
    id: s.id,
    rutinaNombre: s.rutinaNombre,
    estado: s.estado,
    iniciadaAt: s.iniciadaAt,
    finalizadaAt: s.finalizadaAt,
    duracionSeg: s.duracionSeg,
    totalSeries: s.totalSeries ?? seriesCompletadas(lite),
    volumenKg: s.volumenKg ?? volumenSesion(lite),
    ejerciciosRealizados: s.ejercicios.filter((e) => e.series.some((x) => x.completada)).length,
    totalEjercicios: s.ejercicios.length,
    records,
    notas: s.notas,
  };
}

export async function listarHistorial(userId: number, cursor?: number, take = 20) {
  const filas = await prisma.sesionEntrenamiento.findMany({
    where: { usuarioId: userId, estado: 'COMPLETADA' },
    orderBy: { id: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true, rutinaNombre: true, finalizadaAt: true, iniciadaAt: true, duracionSeg: true,
      totalSeries: true, volumenKg: true,
      _count: { select: { ejercicios: true } },
      ejercicios: { select: { series: { where: { esRecord: true }, select: { id: true } } } },
    },
  });
  const hayMas = filas.length > take;
  const items = filas.slice(0, take).map(({ ejercicios, _count, ...f }) => ({
    ...f,
    totalEjercicios: _count.ejercicios,
    records: ejercicios.reduce((acc, e) => acc + e.series.length, 0),
  }));
  return { items, siguiente: hayMas ? items[items.length - 1].id : null };
}
