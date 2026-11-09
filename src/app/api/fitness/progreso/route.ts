import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, parseId, requireActor } from '@/lib/fitness/auth';
import { evolucionEjercicio, resumenProgreso } from '@/lib/fitness/progreso';

export const dynamic = 'force-dynamic';

// Sin parámetros: resumen general. Con ?catalogoId=: evolución de ese ejercicio.
export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const catalogoId = new URL(req.url).searchParams.get('catalogoId');
  const datos = catalogoId ? await evolucionEjercicio(actor.id, parseId(catalogoId, 'catalogoId')) : await resumenProgreso(actor.id);
  return NextResponse.json(datos, noCache);
});
