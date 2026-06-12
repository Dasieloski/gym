import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hoy = new Date();
    const inicio = dayjs(hoy).startOf('day').toDate();
    const fin = dayjs(hoy).endOf('day').toDate();

    const checkins = await prisma.checkIn.findMany({
      where: {
        fecha: { gte: inicio, lte: fin },
      },
      include: {
        cliente: { select: { id: true, nombre: true, foto: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const entradas = checkins.filter(c => c.tipo === 'ENTRADA').length;
    const salidas = checkins.filter(c => c.tipo === 'SALIDA').length;
    const enGimnasio = entradas - salidas;
    const clientesUnicos = Array.from(new Set(checkins.filter(c => c.tipo === 'ENTRADA').map(c => c.clienteId)));

    return NextResponse.json({
      checkins,
      entradas,
      salidas,
      enGimnasio: Math.max(0, enGimnasio),
      clientesUnicosHoy: clientesUnicos.length,
    });
  } catch (error) {
    console.error('Error fetching today checkins:', error);
    return NextResponse.json({ error: 'Error al obtener checkins del dia' }, { status: 500 });
  }
}
