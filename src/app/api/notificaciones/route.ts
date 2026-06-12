import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userId = parseInt(token.sub);
    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const noLeidas = notificaciones.filter(n => !n.leida).length;

    return NextResponse.json({ notificaciones, noLeidas });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userId = parseInt(token.sub);
    const { id } = await req.json();

    if (id) {
      await prisma.notificacion.updateMany({
        where: { id, usuarioId: userId },
        data: { leida: true },
      });
    } else {
      await prisma.notificacion.updateMany({
        where: { usuarioId: userId, leida: false },
        data: { leida: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
