import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';
import { crearRutinaPersonal, listarRutinasCliente } from '@/lib/fitness/rutinas';
import { rutinaSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json(await listarRutinasCliente(actor.id), noCache);
});

export const POST = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const rutina = await crearRutinaPersonal(actor.id, rutinaSchema.parse(await req.json()));
  return NextResponse.json(rutina, { status: 201 });
});
