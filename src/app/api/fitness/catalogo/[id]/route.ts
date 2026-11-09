import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { HttpError, handle, parseId, requireActor } from '@/lib/fitness/auth';
import { catalogoSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

async function editable(req: NextRequest, id: number) {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  const ej = await prisma.catalogoEjercicio.findUnique({ where: { id } });
  if (!ej) throw new HttpError(404, 'Ejercicio no encontrado');
  // Un entrenador solo modifica los ejercicios que él creó; el administrador, cualquiera.
  if (actor.rol !== 'ADMIN' && ej.creadoPorId !== actor.id) throw new HttpError(403, 'Solo puedes modificar ejercicios creados por ti');
  return ej;
}

export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  await requireActor(req, ['CLIENTE', 'ENTRENADOR', 'ADMIN']);
  const ej = await prisma.catalogoEjercicio.findFirst({ where: { id: parseId(params.id), activo: true } });
  if (!ej) throw new HttpError(404, 'Ejercicio no encontrado');
  return NextResponse.json(ej);
});

export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  const id = parseId(params.id);
  await editable(req, id);
  const d = catalogoSchema.parse(await req.json());
  const actualizado = await prisma.catalogoEjercicio.update({
    where: { id },
    data: { ...d, descripcion: d.descripcion ?? null, mediaUrl: d.mediaUrl ?? null, mediaLicencia: d.mediaLicencia ?? null },
  });
  return NextResponse.json(actualizado);
});

// Baja lógica: las rutinas y el historial que lo referencian siguen siendo válidos.
export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  const id = parseId(params.id);
  await editable(req, id);
  await prisma.catalogoEjercicio.update({ where: { id }, data: { activo: false } });
  return NextResponse.json({ success: true });
});
