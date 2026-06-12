import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

export async function deleteOldReservations() {
    const cutoffDate = dayjs().startOf('day').toDate(); // Eliminar reservas hasta el final del día anterior
    const result = await prisma.reserva.deleteMany({ where: { fecha: { lt: cutoffDate } } });

    console.log(`${result.count} reservas antiguas eliminadas.`);
}