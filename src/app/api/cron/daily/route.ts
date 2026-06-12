import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dayjs from '@/lib/dayjs';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const cutoffDate = dayjs().startOf('day').toDate();
    const deleteResult = await prisma.reserva.deleteMany({
      where: { fecha: { lt: cutoffDate } },
    });
    console.log(`${deleteResult.count} reservas antiguas eliminadas.`);

    const today = dayjs().startOf('day');
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month');
    const now = dayjs();

    const usuarios = await prisma.usuario.findMany({
      include: {
        reservasCliente: true,
      },
    });

    for (const usuario of usuarios) {
      const uniqueDays = new Set(
        usuario.reservasCliente
          .filter(r => {
            const fechaReserva = dayjs(r.fecha);
            return fechaReserva.isBefore(now) &&
              fechaReserva.isBetween(startOfMonth, endOfMonth, null, '[]');
          })
          .map(r => dayjs(r.fecha).format('YYYY-MM-DD'))
      );

      const visitasEsteMes = uniqueDays.size;

      if (today.isSame(endOfMonth, 'day')) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { visitasEsteMes: 0 },
        });
      } else {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { visitasEsteMes },
        });
      }
    }

    console.log('Contadores de visitas actualizados para todos los usuarios.');

    return NextResponse.json({
      success: true,
      deletedReservations: deleteResult.count,
      updatedUsers: usuarios.length,
    });
  } catch (error) {
    console.error('Error en cron diario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}