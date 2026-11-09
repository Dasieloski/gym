import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';
import { crearPlantilla, listarPlantillas } from '@/lib/fitness/rutinas';
import { rutinaSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

// Plantillas propias + predeterminadas del gimnasio (creadas por administradores).
export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  return NextResponse.json(await listarPlantillas(actor), noCache);
});

export const POST = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  return NextResponse.json(await crearPlantilla(actor, rutinaSchema.parse(await req.json())), { status: 201 });
});
