import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';

export const dynamic = 'force-dynamic';

// Clientes que el entrenador puede consultar (los asignados a él; el administrador ve todos),
// con un resumen de actividad calculado con una sola consulta agregada (sin N+1).
export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  const clientes = await prisma.usuario.findMany({
    where: { rol: 'CLIENTE', ...(actor.rol === 'ENTRENADOR' ? { entrenadorAsignadoId: actor.id } : {}) },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
    take: 500,
  });
  const hace30 = new Date(Date.now() - 30 * 86_400_000);
  const actividad = await prisma.sesionEntrenamiento.groupBy({
    by: ['usuarioId'],
    where: { usuarioId: { in: clientes.map((c) => c.id) }, estado: 'COMPLETADA' },
    _count: { _all: true },
    _max: { finalizadaAt: true },
  });
  const recientes = await prisma.sesionEntrenamiento.groupBy({
    by: ['usuarioId'],
    where: { usuarioId: { in: clientes.map((c) => c.id) }, estado: 'COMPLETADA', finalizadaAt: { gte: hace30 } },
    _count: { _all: true },
  });
  const porId = new Map(actividad.map((a) => [a.usuarioId, a]));
  const recId = new Map(recientes.map((a) => [a.usuarioId, a._count._all]));
  return NextResponse.json(
    clientes.map((c) => ({
      ...c,
      sesionesTotales: porId.get(c.id)?._count._all ?? 0,
      sesiones30d: recId.get(c.id) ?? 0,
      ultimaSesion: porId.get(c.id)?._max.finalizadaAt ?? null,
    })),
    noCache,
  );
});
