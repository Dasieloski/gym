import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';
import { iniciarSesion, listarHistorial } from '@/lib/fitness/sesiones';
import { iniciarSesionSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

// Historial de sesiones completadas (paginado por cursor).
export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const cursor = parseInt(new URL(req.url).searchParams.get('cursor') || '', 10);
  return NextResponse.json(await listarHistorial(actor.id, Number.isInteger(cursor) ? cursor : undefined), noCache);
});

// Inicia (o recupera, si es un reintento) una sesión. 201 si se creó, 200 si ya existía.
export const POST = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const d = iniciarSesionSchema.parse(await req.json());
  const { sesion, creada } = await iniciarSesion(actor.id, d);
  return NextResponse.json(sesion, { status: creada ? 201 : 200 });
});
