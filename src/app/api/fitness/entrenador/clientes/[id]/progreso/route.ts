import { NextRequest, NextResponse } from 'next/server';
import { assertClienteAutorizado, handle, noCache, parseId, requireActor } from '@/lib/fitness/auth';
import { evolucionEjercicio, resumenProgreso } from '@/lib/fitness/progreso';
import { listarHistorial } from '@/lib/fitness/sesiones';

export const dynamic = 'force-dynamic';

// Solo lectura. La autorización (cliente asignado a este entrenador, o administrador) se valida en servidor.
export const GET = handle(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  const clienteId = parseId(params.id);
  await assertClienteAutorizado(actor, clienteId);

  const p = new URL(req.url).searchParams;
  const catalogoId = p.get('catalogoId');
  if (catalogoId) return NextResponse.json(await evolucionEjercicio(clienteId, parseId(catalogoId, 'catalogoId')), noCache);

  const [progreso, historial] = await Promise.all([resumenProgreso(clienteId), listarHistorial(clienteId, undefined, 10)]);
  return NextResponse.json({ ...progreso, historial: historial.items }, noCache);
});
