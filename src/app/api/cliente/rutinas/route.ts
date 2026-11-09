import { NextRequest, NextResponse } from 'next/server';
import { handle, noCache, requireActor } from '@/lib/fitness/auth';
import { listarRutinasCliente } from '@/lib/fitness/rutinas';

export const dynamic = 'force-dynamic';

// Ruta heredada: devolvía rutinas aceptando un clienteId arbitrario. Ahora responde siempre con
// las rutinas del usuario autenticado; el módulo completo vive en /api/fitness/rutinas.
export const GET = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json(await listarRutinasCliente(actor.id), noCache);
});
