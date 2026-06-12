import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('usuarioId');
    const tipo = searchParams.get('tipo');

    const where: Record<string, unknown> = {};
    if (userId) where.usuarioId = parseInt(userId);
    if (tipo) where.tipo = tipo;

    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { usuario: { select: { id: true, nombre: true } } },
    });

    return NextResponse.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { usuarioId, titulo, mensaje, tipo } = await req.json();

    if (!usuarioId || !titulo || !mensaje) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const notificacion = await prisma.notificacion.create({
      data: { usuarioId, titulo, mensaje, tipo: tipo || 'INFO' },
    });

    return NextResponse.json(notificacion);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.notificacion.update({ where: { id }, data: { leida: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
