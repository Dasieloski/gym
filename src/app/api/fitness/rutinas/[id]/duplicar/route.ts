import { NextRequest, NextResponse } from 'next/server';
import { handle, parseId, requireActor } from '@/lib/fitness/auth';
import { duplicarRutina } from '@/lib/fitness/rutinas';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json(await duplicarRutina(actor.id, parseId(params.id)), { status: 201 });
});
