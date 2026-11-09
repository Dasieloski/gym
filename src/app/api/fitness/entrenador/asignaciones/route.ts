import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, parseId, requireActor } from '@/lib/fitness/auth';
import { asignarRutina, listarAsignaciones } from '@/lib/fitness/rutinas';
import { asignarSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  const clienteId = new URL(req.url).searchParams.get('clienteId');
  return NextResponse.json(await listarAsignaciones(actor, clienteId ? parseId(clienteId, 'clienteId') : undefined), noCache);
});

// Asigna copiando una plantilla (o una asignación anterior) a un cliente autorizado.
export const POST = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  const { rutinaId, clienteId } = asignarSchema.parse(await req.json());
  return NextResponse.json(await asignarRutina(actor, rutinaId, clienteId), { status: 201 });
});
