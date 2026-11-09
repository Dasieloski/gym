import { NextRequest, NextResponse } from 'next/server';
import { handle, parseId, requireActor } from '@/lib/fitness/auth';
import { cancelarSesion } from '@/lib/fitness/sesiones';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json(await cancelarSesion(actor.id, parseId(params.id)));
});
