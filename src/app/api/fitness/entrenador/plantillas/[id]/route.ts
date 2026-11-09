import { NextRequest, NextResponse } from 'next/server';
import { handle, parseId, requireActor } from '@/lib/fitness/auth';
import { actualizarRutinaEntrenador, eliminarPlantilla } from '@/lib/fitness/rutinas';
import { rutinaSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  return NextResponse.json(await actualizarRutinaEntrenador(actor, parseId(params.id), rutinaSchema.parse(await req.json())));
});

export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  await eliminarPlantilla(actor, parseId(params.id));
  return NextResponse.json({ success: true });
});
