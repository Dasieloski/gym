import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handle, noCache, parseId, requireActor } from '@/lib/fitness/auth';
import {
  actualizarRutinaPersonal, archivarRutinaPersonal, eliminarRutinaPersonal, obtenerRutinaCliente,
} from '@/lib/fitness/rutinas';
import { rutinaSchema } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

// El id de la ruta nunca basta: cada operación filtra por el usuario del token.
export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['CLIENTE']);
  return NextResponse.json(await obtenerRutinaCliente(actor.id, parseId(params.id)), noCache);
});

export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const rutina = await actualizarRutinaPersonal(actor.id, parseId(params.id), rutinaSchema.parse(await req.json()));
  return NextResponse.json(rutina);
});

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['CLIENTE']);
  const { archivada } = z.object({ archivada: z.boolean() }).parse(await req.json());
  return NextResponse.json(await archivarRutinaPersonal(actor.id, parseId(params.id), archivada));
});

export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  const actor = await requireActor(req, ['CLIENTE']);
  await eliminarRutinaPersonal(actor.id, parseId(params.id));
  return NextResponse.json({ success: true });
});
