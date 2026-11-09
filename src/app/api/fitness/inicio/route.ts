import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';
import { datosInicio } from '@/lib/fitness/progreso';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json(await datosInicio(actor.id), noCache);
});
