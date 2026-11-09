import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';
import { sesionActiva } from '@/lib/fitness/sesiones';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json({ sesion: await sesionActiva(actor.id) }, noCache);
});
