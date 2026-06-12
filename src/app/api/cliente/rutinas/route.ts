import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userId = parseInt(token.sub);
    const rol = token.rol;
    const { searchParams } = new URL(req.url);
    const clienteIdParam = searchParams.get('clienteId');

    let where: Record<string, unknown> = { activa: true };

    if (clienteIdParam) {
      where.clienteId = parseInt(clienteIdParam);
    } else if (rol === 'CLIENTE') {
      const clientData = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { entrenadorAsignadoId: true },
      });
      if (clientData?.entrenadorAsignadoId) {
        where.creadorId = clientData.entrenadorAsignadoId;
      }
      where.clienteId = userId;
    } else if (rol === 'ENTRENADOR') {
      const assignedIds = await prisma.usuario.findMany({
        where: { entrenadorAsignadoId: userId },
        select: { id: true },
      });
      where.clienteId = { in: assignedIds.map(u => u.id) };
    }

    const rutinas = await prisma.rutina.findMany({
      where,
      include: {
        ejercicios: { orderBy: { orden: 'asc' } },
        cliente: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rutinas);
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
