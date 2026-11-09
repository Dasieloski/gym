import { NextRequest, NextResponse } from 'next/server';
import { handle, parseId, requireActor } from '@/lib/fitness/auth';
import { guardarSerie } from '@/lib/fitness/sesiones';
import { serieSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

// PUT es idempotente: la serie se identifica por (ejercicio, número), repetir la petición no duplica.
export const PUT = handle(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const serie = await guardarSerie(actor.id, parseId(params.id), serieSchema.parse(await req.json()));
  return NextResponse.json(serie);
});
