import prisma from '@/lib/prisma';
import { HttpError } from './auth';
import { claveDia, frecuenciaMensual, frecuenciaSemanal, nombreDiaSemana } from './metrics';

/**
 * Progreso de un usuario. Todos los datos salen de series completadas de sesiones COMPLETADA;
 * nada se estima ni se rellena. El llamador es responsable de haber autorizado el acceso a `userId`.
 */
export async function resumenProgreso(userId: number) {
  const hace190 = new Date(Date.now() - 190 * 86_400_000);
  const [sesiones, records, totales, ejerciciosConHistorial] = await Promise.all([
    prisma.sesionEntrenamiento.findMany({
      where: { usuarioId: userId, estado: 'COMPLETADA', finalizadaAt: { gte: hace190 } },
      select: { finalizadaAt: true },
    }),
    prisma.recordPersonal.findMany({
      where: { usuarioId: userId },
      orderBy: { logradoAt: 'desc' },
      take: 100,
      include: { catalogo: { select: { id: true, nombre: true, musculoPrincipal: true, tipoMedicion: true } } },
    }),
    prisma.sesionEntrenamiento.aggregate({
      where: { usuarioId: userId, estado: 'COMPLETADA' },
      _count: { _all: true },
      _sum: { volumenKg: true, duracionSeg: true, totalSeries: true },
    }),
    prisma.sesionEjercicio.findMany({
      where: { catalogoId: { not: null }, sesion: { usuarioId: userId, estado: 'COMPLETADA' } },
      distinct: ['catalogoId'],
      select: { catalogo: { select: { id: true, nombre: true, tipoMedicion: true } } },
    }),
  ]);

  const fechas = sesiones.map((s) => s.finalizadaAt!).filter(Boolean);
  return {
    totales: {
      sesiones: totales._count._all,
      series: totales._sum.totalSeries ?? 0,
      volumenKg: totales._sum.volumenKg ?? 0,
      duracionSeg: totales._sum.duracionSeg ?? 0,
    },
    frecuenciaSemanal: frecuenciaSemanal(fechas, 12),
    frecuenciaMensual: frecuenciaMensual(fechas, 6),
    records: records.map((r) => ({
      id: r.id, catalogoId: r.catalogoId, ejercicio: r.catalogo.nombre, musculo: r.catalogo.musculoPrincipal,
      tipo: r.tipo, valor: r.valor, reps: r.reps, fecha: r.logradoAt,
    })),
    ejercicios: ejerciciosConHistorial
      .map((e) => e.catalogo)
      .filter((c): c is NonNullable<typeof c> => !!c)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
  };
}

/**
 * Evolución de un ejercicio, una marca por sesión:
 *  - PESO_REPS: mayor peso (kg) con ≥1 repetición, y volumen (kg·rep) de ese ejercicio en la sesión.
 *  - SOLO_REPS: mayor número de repeticiones.
 *  - TIEMPO: mayor duración (s).
 * Cada ejercicio tiene una única unidad, por lo que nunca se mezclan unidades incompatibles.
 */
export async function evolucionEjercicio(userId: number, catalogoId: number) {
  const catalogo = await prisma.catalogoEjercicio.findUnique({
    where: { id: catalogoId },
    select: { id: true, nombre: true, tipoMedicion: true },
  });
  if (!catalogo) throw new HttpError(404, 'Ejercicio no encontrado');

  const filas = await prisma.sesionEjercicio.findMany({
    where: { catalogoId, sesion: { usuarioId: userId, estado: 'COMPLETADA' } },
    orderBy: { sesion: { finalizadaAt: 'desc' } },
    take: 60,
    select: {
      tipoMedicion: true,
      sesion: { select: { id: true, finalizadaAt: true } },
      series: { where: { completada: true }, select: { peso: true, repeticiones: true, duracionSeg: true } },
    },
  });

  const puntos = filas
    .map((f) => {
      let valor: number | null = null;
      let volumen = 0;
      for (const s of f.series) {
        if (f.tipoMedicion === 'PESO_REPS') {
          if (s.peso && s.repeticiones && s.repeticiones >= 1) {
            valor = Math.max(valor ?? 0, s.peso);
            volumen += s.peso * s.repeticiones;
          }
        } else if (f.tipoMedicion === 'SOLO_REPS') {
          if (s.repeticiones) valor = Math.max(valor ?? 0, s.repeticiones);
        } else if (s.duracionSeg) valor = Math.max(valor ?? 0, s.duracionSeg);
      }
      return valor == null
        ? null
        : { sesionId: f.sesion.id, fecha: f.sesion.finalizadaAt!, valor, volumen: Math.round(volumen) };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .reverse();

  const unidad = catalogo.tipoMedicion === 'PESO_REPS' ? 'kg' : catalogo.tipoMedicion === 'SOLO_REPS' ? 'reps' : 's';
  return { ejercicio: catalogo, unidad, puntos };
}

/** Datos de la pantalla de inicio del cliente, todos reales y de su propia cuenta. */
export async function datosInicio(userId: number) {
  const ahora = new Date();
  const hoy = nombreDiaSemana(ahora);
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioSemana = new Date(`${claveSemanaActual(ahora)}T00:00:00`);

  const [usuario, rutinas, activa, recientes, semana, records, avisos, asistenciasMes, proximaReserva] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        nombre: true,
        membresiaActual: { select: { tipo: true, fechaInicio: true, fechaFin: true, estadoPago: true, congelada: true } },
        entrenadorAsignado: { select: { nombre: true, telefono: true } },
      },
    }),
    prisma.rutina.findMany({
      where: { clienteId: userId, tipo: { in: ['PERSONAL', 'ASIGNADA'] }, activa: true },
      select: { id: true, nombre: true, tipo: true, ejercicios: { select: { diaSemana: true } } },
    }),
    prisma.sesionEntrenamiento.findFirst({
      where: { usuarioId: userId, estado: 'EN_CURSO' },
      select: { id: true, rutinaNombre: true, iniciadaAt: true },
    }),
    prisma.sesionEntrenamiento.findMany({
      where: { usuarioId: userId, estado: 'COMPLETADA' },
      orderBy: { finalizadaAt: 'desc' },
      take: 3,
      select: { id: true, rutinaNombre: true, finalizadaAt: true, duracionSeg: true, totalSeries: true, volumenKg: true },
    }),
    prisma.sesionEntrenamiento.aggregate({
      where: { usuarioId: userId, estado: 'COMPLETADA', finalizadaAt: { gte: inicioSemana } },
      _count: { _all: true },
      _sum: { volumenKg: true, duracionSeg: true, totalSeries: true },
    }),
    prisma.recordPersonal.findMany({
      where: { usuarioId: userId },
      orderBy: { logradoAt: 'desc' },
      take: 3,
      include: { catalogo: { select: { nombre: true } } },
    }),
    prisma.notificacion.findMany({
      where: { usuarioId: userId, leida: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, titulo: true, mensaje: true, tipo: true, createdAt: true },
    }),
    prisma.checkIn.count({ where: { clienteId: userId, fecha: { gte: inicioMes } } }),
    prisma.reserva.findFirst({
      where: { clienteId: userId, estado: 'ACTIVA', fecha: { gte: ahora } },
      orderBy: { fecha: 'asc' },
      select: { id: true, fecha: true },
    }),
  ]);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado');

  const m = usuario.membresiaActual;
  const diasRestantes = m ? Math.ceil((m.fechaFin.getTime() - ahora.getTime()) / 86_400_000) : null;
  const estadoMembresia = !m ? 'SIN_MEMBRESIA' : m.congelada ? 'CONGELADA' : diasRestantes! < 0 ? 'VENCIDA' : diasRestantes! <= 7 ? 'POR_VENCER' : 'ACTIVA';

  // Entrenamiento de hoy: rutinas con ejercicios programados para el día actual.
  const deHoy = rutinas
    .filter((r) => r.ejercicios.some((e) => e.diaSemana === hoy))
    .map((r) => ({ id: r.id, nombre: r.nombre, tipo: r.tipo, diaSemana: hoy, ejercicios: r.ejercicios.filter((e) => e.diaSemana === hoy || !e.diaSemana).length }));

  return {
    nombre: usuario.nombre,
    membresia: m && { ...m, diasRestantes, estado: estadoMembresia },
    estadoMembresia,
    entrenador: usuario.entrenadorAsignado,
    hoy: { dia: hoy, rutinas: deHoy },
    sesionActiva: activa,
    totalRutinas: rutinas.length,
    semana: {
      sesiones: semana._count._all,
      series: semana._sum.totalSeries ?? 0,
      volumenKg: semana._sum.volumenKg ?? 0,
      duracionSeg: semana._sum.duracionSeg ?? 0,
    },
    ultimasSesiones: recientes,
    records: records.map((r) => ({ id: r.id, ejercicio: r.catalogo.nombre, tipo: r.tipo, valor: r.valor, fecha: r.logradoAt })),
    avisos,
    asistenciasMes,
    proximaReserva,
  };
}

function claveSemanaActual(fecha: Date): string {
  const dia = claveDia(fecha);
  const [y, m, d] = dia.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
}
