import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, parseId, requireActor } from '@/lib/fitness/auth';
import { obtenerSesion, resumenSesion } from '@/lib/fitness/sesiones';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const sesion = await obtenerSesion(actor.id, parseId(params.id));
  return NextResponse.json({ sesion, resumen: resumenSesion(sesion) }, noCache);
});
