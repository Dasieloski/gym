import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { Actor, HttpError, assertClienteAutorizado } from './auth';
import { MAX_RUTINAS_PERSONALES } from './constants';
import type { RutinaInput } from './validation';

// Una sola consulta con todo lo necesario para listar rutinas (sin N+1).
export const includeRutina = {
  ejercicios: {
    orderBy: { orden: 'asc' },
    include: {
      catalogo: {
        select: { id: true, nombre: true, musculoPrincipal: true, equipamiento: true, tipoMedicion: true, mediaUrl: true },
      },
    },
  },
  creador: { select: { id: true, nombre: true, rol: true } },
  cliente: { select: { id: true, nombre: true } },
} satisfies Prisma.RutinaInclude;

export type RutinaConEjercicios = Prisma.RutinaGetPayload<{ include: typeof includeRutina }>;

type Tx = Prisma.TransactionClient;

/** Comprueba que todos los ejercicios existen y están activos; devuelve su nombre para el snapshot. */
async function cargarCatalogo(db: Tx | typeof prisma, ids: number[]) {
  const unicos = Array.from(new Set(ids));
  const filas = await db.catalogoEjercicio.findMany({
    where: { id: { in: unicos }, activo: true },
    select: { id: true, nombre: true, tipoMedicion: true },
  });
  if (filas.length !== unicos.length) throw new HttpError(400, 'Algún ejercicio del catálogo no existe o está desactivado');
  return new Map(filas.map((f) => [f.id, f]));
}

function filasEjercicios(input: RutinaInput, catalogo: Map<number, { nombre: string; tipoMedicion: string }>) {
  return input.ejercicios.map((e, i) => {
    const cat = catalogo.get(e.catalogoId)!;
    return {
      catalogoId: e.catalogoId,
      nombre: cat.nombre, // snapshot: las vistas heredadas siguen mostrando el nombre
      series: e.series,
      repeticiones: e.repeticiones,
      peso: cat.tipoMedicion === 'PESO_REPS' ? e.peso ?? null : null,
      duracionSeg: cat.tipoMedicion === 'TIEMPO' ? e.duracionSeg ?? null : null,
      descansoSeg: e.descansoSeg ?? null,
      diaSemana: e.diaSemana ?? null,
      notas: e.notas ?? null,
      orden: i,
    };
  });
}

// ---------------------------------------------------------------------------
// Cliente: rutinas personales y asignadas
// ---------------------------------------------------------------------------

export async function listarRutinasCliente(userId: number) {
  return prisma.rutina.findMany({
    where: {
      clienteId: userId,
      OR: [
        { tipo: 'PERSONAL' }, // activa=false significa archivada, se sigue mostrando
        { tipo: 'ASIGNADA', activa: true }, // activa=false significa retirada por el entrenador
      ],
    },
    include: includeRutina,
    orderBy: [{ activa: 'desc' }, { updatedAt: 'desc' }],
  });
}

export async function obtenerRutinaCliente(userId: number, id: number) {
  const r = await prisma.rutina.findFirst({
    where: { id, clienteId: userId, tipo: { in: ['PERSONAL', 'ASIGNADA'] } },
    include: includeRutina,
  });
  if (!r || (r.tipo === 'ASIGNADA' && !r.activa)) throw new HttpError(404, 'Rutina no encontrada');
  return r;
}

export async function crearRutinaPersonal(userId: number, input: RutinaInput) {
  const total = await prisma.rutina.count({ where: { clienteId: userId, tipo: 'PERSONAL' } });
  if (total >= MAX_RUTINAS_PERSONALES) throw new HttpError(400, `Máximo ${MAX_RUTINAS_PERSONALES} rutinas personales`);
  const catalogo = await cargarCatalogo(prisma, input.ejercicios.map((e) => e.catalogoId));
  return prisma.rutina.create({
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      clienteId: userId,
      creadorId: userId,
      tipo: 'PERSONAL',
      ejercicios: { create: filasEjercicios(input, catalogo) },
    },
    include: includeRutina,
  });
}

async function rutinaPropia(userId: number, id: number) {
  const r = await prisma.rutina.findFirst({ where: { id, clienteId: userId, tipo: { in: ['PERSONAL', 'ASIGNADA'] } } });
  if (!r) throw new HttpError(404, 'Rutina no encontrada');
  if (r.tipo !== 'PERSONAL') {
    throw new HttpError(403, 'Las rutinas asignadas por tu entrenador no se pueden modificar. Crea una copia personal para adaptarla.');
  }
  return r;
}

export async function actualizarRutinaPersonal(userId: number, id: number, input: RutinaInput) {
  await rutinaPropia(userId, id);
  const catalogo = await cargarCatalogo(prisma, input.ejercicios.map((e) => e.catalogoId));
  return prisma.rutina.update({
    where: { id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      ejercicios: { deleteMany: {}, create: filasEjercicios(input, catalogo) },
    },
    include: includeRutina,
  });
}

export async function archivarRutinaPersonal(userId: number, id: number, archivada: boolean) {
  await rutinaPropia(userId, id);
  return prisma.rutina.update({ where: { id }, data: { activa: !archivada }, include: includeRutina });
}

export async function eliminarRutinaPersonal(userId: number, id: number) {
  await rutinaPropia(userId, id);
  // Las sesiones realizadas conservan su historial (rutinaId pasa a null y el nombre queda guardado).
  await prisma.rutina.delete({ where: { id } });
}

/** Crea una copia personal editable de una rutina propia o asignada. */
export async function duplicarRutina(userId: number, id: number) {
  const total = await prisma.rutina.count({ where: { clienteId: userId, tipo: 'PERSONAL' } });
  if (total >= MAX_RUTINAS_PERSONALES) throw new HttpError(400, `Máximo ${MAX_RUTINAS_PERSONALES} rutinas personales`);
  const origen = await obtenerRutinaCliente(userId, id);
  return prisma.rutina.create({
    data: {
      nombre: `${origen.nombre} (copia)`.slice(0, 100),
      descripcion: origen.descripcion,
      clienteId: userId,
      creadorId: userId,
      tipo: 'PERSONAL',
      plantillaOrigenId: origen.id,
      ejercicios: { create: origen.ejercicios.map(copiaEjercicio) },
    },
    include: includeRutina,
  });
}

function copiaEjercicio(e: RutinaConEjercicios['ejercicios'][number]) {
  return {
    catalogoId: e.catalogoId, nombre: e.nombre, descripcion: e.descripcion, series: e.series,
    repeticiones: e.repeticiones, peso: e.peso, duracionSeg: e.duracionSeg, descansoSeg: e.descansoSeg,
    diaSemana: e.diaSemana, orden: e.orden, notas: e.notas,
  };
}

// ---------------------------------------------------------------------------
// Entrenador / administrador: plantillas y asignaciones
// ---------------------------------------------------------------------------

/** Plantillas propias del entrenador más las predeterminadas creadas por administradores. */
export async function listarPlantillas(actor: Actor) {
  return prisma.rutina.findMany({
    where: {
      tipo: 'PLANTILLA',
      activa: true,
      ...(actor.rol === 'ADMIN' ? {} : { OR: [{ creadorId: actor.id }, { creador: { rol: 'ADMIN' } }] }),
    },
    include: includeRutina,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function crearPlantilla(actor: Actor, input: RutinaInput) {
  const catalogo = await cargarCatalogo(prisma, input.ejercicios.map((e) => e.catalogoId));
  return prisma.rutina.create({
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      clienteId: actor.id, // las plantillas pertenecen a su creador, no a un cliente
      creadorId: actor.id,
      tipo: 'PLANTILLA',
      ejercicios: { create: filasEjercicios(input, catalogo) },
    },
    include: includeRutina,
  });
}

async function plantillaOAsignadaDe(actor: Actor, id: number) {
  const r = await prisma.rutina.findFirst({ where: { id, tipo: { in: ['PLANTILLA', 'ASIGNADA'] } }, include: includeRutina });
  if (!r) throw new HttpError(404, 'Rutina no encontrada');
  const esPropia = r.creadorId === actor.id;
  const esPredeterminada = r.tipo === 'PLANTILLA' && r.creador.rol === 'ADMIN';
  if (actor.rol !== 'ADMIN' && !esPropia && !esPredeterminada) throw new HttpError(404, 'Rutina no encontrada');
  return r;
}

export async function actualizarRutinaEntrenador(actor: Actor, id: number, input: RutinaInput) {
  const r = await plantillaOAsignadaDe(actor, id);
  if (actor.rol !== 'ADMIN' && r.creadorId !== actor.id) throw new HttpError(403, 'Solo puedes editar tus propias rutinas');
  if (r.tipo === 'ASIGNADA') await assertClienteAutorizado(actor, r.clienteId);
  const catalogo = await cargarCatalogo(prisma, input.ejercicios.map((e) => e.catalogoId));
  return prisma.rutina.update({
    where: { id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      ejercicios: { deleteMany: {}, create: filasEjercicios(input, catalogo) },
    },
    include: includeRutina,
  });
}

/** Copia una plantilla (o una asignación previa) a un cliente autorizado como rutina ASIGNADA. */
export async function asignarRutina(actor: Actor, rutinaId: number, clienteId: number) {
  await assertClienteAutorizado(actor, clienteId);
  const origen = await plantillaOAsignadaDe(actor, rutinaId);
  const asignada = await prisma.rutina.create({
    data: {
      nombre: origen.nombre,
      descripcion: origen.descripcion,
      clienteId,
      creadorId: actor.id,
      tipo: 'ASIGNADA',
      plantillaOrigenId: origen.tipo === 'PLANTILLA' ? origen.id : origen.plantillaOrigenId,
      ejercicios: { create: origen.ejercicios.map(copiaEjercicio) },
    },
    include: includeRutina,
  });
  await prisma.notificacion.create({
    data: {
      usuarioId: clienteId,
      titulo: 'Nueva rutina asignada',
      mensaje: `Tu entrenador te asignó la rutina "${asignada.nombre}".`,
      tipo: 'INFO',
    },
  });
  return asignada;
}

export async function listarAsignaciones(actor: Actor, clienteId?: number) {
  if (clienteId !== undefined) await assertClienteAutorizado(actor, clienteId);
  return prisma.rutina.findMany({
    where: {
      tipo: 'ASIGNADA',
      ...(actor.rol === 'ADMIN' ? {} : { creadorId: actor.id }),
      ...(clienteId !== undefined ? { clienteId } : {}),
    },
    include: includeRutina,
    orderBy: { createdAt: 'desc' },
  });
}

/** Retira una asignación: el cliente deja de verla, su historial de sesiones no se toca. */
export async function retirarAsignacion(actor: Actor, id: number) {
  const r = await plantillaOAsignadaDe(actor, id);
  if (r.tipo !== 'ASIGNADA') throw new HttpError(400, 'Solo se pueden retirar rutinas asignadas');
  if (actor.rol !== 'ADMIN' && r.creadorId !== actor.id) throw new HttpError(403, 'Solo puedes retirar tus asignaciones');
  await assertClienteAutorizado(actor, r.clienteId);
  return prisma.rutina.update({ where: { id }, data: { activa: false }, include: includeRutina });
}

export async function eliminarPlantilla(actor: Actor, id: number) {
  const r = await plantillaOAsignadaDe(actor, id);
  if (r.tipo !== 'PLANTILLA') throw new HttpError(400, 'Solo se pueden eliminar plantillas');
  if (actor.rol !== 'ADMIN' && r.creadorId !== actor.id) throw new HttpError(403, 'Solo puedes eliminar tus propias plantillas');
  await prisma.rutina.delete({ where: { id } });
}
