import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub || token.rol !== 'ENTRENADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const entrenadorId = parseInt(token.sub);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [totalPagos, pagosMes, pagosSemana, clientesAtendidos, ultimosPagos] = await Promise.all([
      prisma.pagoEntrenador.aggregate({
        where: { entrenadorId },
        _sum: { monto: true },
        _count: true,
      }),
      prisma.pagoEntrenador.aggregate({
        where: { entrenadorId, fechaPago: { gte: startOfMonth } },
        _sum: { monto: true },
        _count: true,
      }),
      prisma.pagoEntrenador.aggregate({
        where: { entrenadorId, fechaPago: { gte: startOfWeek } },
        _sum: { monto: true },
        _count: true,
      }),
      prisma.pagoEntrenador.groupBy({
        by: ['clienteId'],
        where: { entrenadorId },
      }),
      prisma.pagoEntrenador.findMany({
        where: { entrenadorId },
        include: { cliente: { select: { nombre: true } } },
        orderBy: { fechaPago: 'desc' },
        take: 5,
      }),
    ]);

    const clienteIds = clientesAtendidos.map(c => c.clienteId);
    const clientesInfo = clienteIds.length > 0
      ? await prisma.usuario.findMany({
          where: { id: { in: clienteIds } },
          select: { id: true, nombre: true },
        })
      : [];

    return NextResponse.json({
      total: {
        monto: Number(totalPagos._sum.monto) || 0,
        count: totalPagos._count,
      },
      esteMes: {
        monto: Number(pagosMes._sum.monto) || 0,
        count: pagosMes._count,
      },
      estaSemana: {
        monto: Number(pagosSemana._sum.monto) || 0,
        count: pagosSemana._count,
      },
      clientesUnicos: clientesInfo,
      ultimosPagos,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
