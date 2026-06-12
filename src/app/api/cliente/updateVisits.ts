import prisma from '@/lib/prisma';
import dayjs from '@/lib/dayjs'; // Asegúrate de ajustar la ruta según tu estructura de carpetas



export async function updateVisits() {
  const today = dayjs().startOf('day'); // Obtener el inicio del día actual
  const startOfMonth = today.startOf('month'); // Obtener el inicio del mes actual
  const endOfMonth = today.endOf('month'); // Obtener el final del mes actual
  const now = dayjs(); // Obtener la fecha y hora actual

  // Obtener todos los usuarios
  const usuarios = await prisma.usuario.findMany({
    include: {
      reservasCliente: true, // Incluir reservas para contar visitas
    },
  });

  for (const usuario of usuarios) {
    // Obtener los días únicos de reservas en el mes actual
    const uniqueDays = new Set(
      usuario.reservasCliente
        .filter(r => {
          const fechaReserva = dayjs(r.fecha);
          return fechaReserva.isBefore(now) && // Solo contar reservas pasadas
            fechaReserva.isBetween(startOfMonth, endOfMonth, null, '[]'); // Incluir el rango
        })
        .map(r => dayjs(r.fecha).format('YYYY-MM-DD')) // Convertir a string para obtener solo la fecha
    );

    const visitasEsteMes = uniqueDays.size; // Contar los días únicos

    // Si es el último día del mes, reiniciar el contador de visitas
    if (today.isSame(endOfMonth, 'day')) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { visitasEsteMes: 0 } as any, // Reiniciar contador
      });
    } else {
      // Actualizar el campo visitasEsteMes en la base de datos
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { visitasEsteMes } as any, // Actualizar el campo visitasEsteMes
      });
    }
  }

  console.log('Contadores de visitas actualizados para todos los usuarios.');
}
