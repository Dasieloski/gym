import { NextRequest, NextResponse } from 'next/server';
import { handle, parseId, requireActor } from '@/lib/fitness/auth';
import { actualizarRutinaEntrenador, retirarAsignacion } from '@/lib/fitness/rutinas';
import { rutinaSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  return NextResponse.json(await actualizarRutinaEntrenador(actor, parseId(params.id), rutinaSchema.parse(await req.json())));
});

// Retirar = el cliente deja de ver la rutina; su historial de sesiones se conserva.
export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  return NextResponse.json(await retirarAsignacion(actor, parseId(params.id)));
});
