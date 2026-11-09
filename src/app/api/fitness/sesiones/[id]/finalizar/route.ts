import { NextRequest, NextResponse } from 'next/server';
import { handle, parseId, requireActor } from '@/lib/fitness/auth';
import { finalizarSesion } from '@/lib/fitness/sesiones';
import { finalizarSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const cuerpo = await req.json().catch(() => ({}));
  const { notas } = finalizarSchema.parse(cuerpo);
  return NextResponse.json(await finalizarSesion(actor.id, parseId(params.id), notas));
});
