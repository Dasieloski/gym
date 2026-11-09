import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';

export type RolApp = 'ADMIN' | 'ENTRENADOR' | 'CLIENTE' | 'CLIENTEESPERA';

export interface Actor {
  id: number;
  rol: RolApp;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Identifica al usuario a partir del JWT firmado de NextAuth y relee su rol en BD:
 * así un cambio de rol (p. ej. un cliente que pasa a CLIENTEESPERA) surte efecto
 * aunque el token siga vigente. Nunca se confía en ningún id enviado por el navegador.
 */
export async function requireActor(req: NextRequest, roles: RolApp[]): Promise<Actor> {
  const token = await getToken({ req });
  const id = token?.sub ? parseInt(token.sub, 10) : NaN;
  if (!Number.isInteger(id)) throw new HttpError(401, 'No autorizado');

  const usuario = await prisma.usuario.findUnique({ where: { id }, select: { id: true, rol: true } });
  if (!usuario) throw new HttpError(401, 'No autorizado');
  if (!roles.includes(usuario.rol as RolApp)) throw new HttpError(403, 'Prohibido');
  return { id: usuario.id, rol: usuario.rol as RolApp };
}

/**
 * Un entrenador solo accede a los clientes que tiene asignados (Usuario.entrenadorAsignadoId);
 * un administrador accede a cualquier cliente. Se responde 404 (no 403) para no revelar
 * qué ids existen.
 */
export async function assertClienteAutorizado(actor: Actor, clienteId: number): Promise<void> {
  if (!Number.isInteger(clienteId)) throw new HttpError(400, 'Cliente inválido');
  if (actor.rol === 'CLIENTE') {
    if (clienteId !== actor.id) throw new HttpError(404, 'No encontrado');
    return;
  }
  const cliente = await prisma.usuario.findUnique({
    where: { id: clienteId },
    select: { rol: true, entrenadorAsignadoId: true },
  });
  if (!cliente || cliente.rol !== 'CLIENTE') throw new HttpError(404, 'No encontrado');
  if (actor.rol === 'ADMIN') return;
  if (actor.rol === 'ENTRENADOR' && cliente.entrenadorAsignadoId === actor.id) return;
  throw new HttpError(404, 'No encontrado');
}

/** Acceso a los datos de un cliente: él mismo, su entrenador asignado o un administrador. */
export async function requireAccesoCliente(req: NextRequest, clienteId: number): Promise<Actor> {
  const actor = await requireActor(req, ['CLIENTE', 'ENTRENADOR', 'ADMIN']);
  await assertClienteAutorizado(actor, clienteId);
  return actor;
}

export function parseId(valor: string | null | undefined, nombre = 'id'): number {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${nombre} inválido`);
  return n;
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<NextResponse>;

/** Envuelve un handler: traduce errores controlados a respuestas JSON sin filtrar detalles internos. */
export function handle<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        const sesionActivaId = (e as HttpError & { sesionActivaId?: number }).sesionActivaId;
        return NextResponse.json({ error: e.message, ...(sesionActivaId ? { sesionActivaId } : {}) }, { status: e.status });
      }
      if (e instanceof ZodError) {
        const detalle = e.issues[0];
        return NextResponse.json(
          { error: `Datos inválidos${detalle ? `: ${detalle.path.join('.')} ${detalle.message}` : ''}` },
          { status: 400 },
        );
      }
      if (e instanceof SyntaxError) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
      console.error('[fitness] error inesperado:', e instanceof Error ? e.message : 'desconocido');
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
  };
}

/**
 * Para rutas heredadas que no usan `handle`: devuelve la respuesta de error si el llamador no puede
 * acceder a los datos del cliente, o null si tiene acceso.
 */
export async function denegarAccesoCliente(req: NextRequest, clienteId: number): Promise<NextResponse | null> {
  const r = await handle(async () => {
    await requireAccesoCliente(req, clienteId);
    return NextResponse.json({ ok: true });
  })(req, undefined);
  return r.ok ? null : r;
}

export const noCache = { headers: { 'Cache-Control': 'no-store' } };
