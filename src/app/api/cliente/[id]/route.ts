import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Función para convertir hora de formato 12 horas a 24 horas
function convertirHora12a24(hora12: string): string {
  const [tiempo, periodo] = hora12.split(' ');
  let [horas, minutos] = tiempo.split(':').map(Number);

  if (periodo.toUpperCase() === 'PM' && horas !== 12) {
    horas += 12;
  } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
    horas = 0;
  }

  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        reservasCliente: {
          include: {
            entrenador: {
              include: {
                usuario: true,
              },
            },
          },
        },
        membresias: true,
        membresiaActual: true,
        entrenador: true,
        entrenadorAsignado: {
          include: {
            entrenador: true,
          },
        },
        checkIns: {
          orderBy: { fecha: 'desc' },
          take: 20,
        },
        pagos: {
          orderBy: { fechaPago: 'desc' },
          take: 20,
        },
      },
    });

    console.log(usuario); // Agrega esta línea para depurar

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener la fecha actual
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const now = new Date(); // Obtener la fecha y hora actual

    // Obtener los días únicos de reservas en el mes actual
    const uniqueDays = new Set(
      usuario.reservasCliente
        .filter(r => {
          const fechaReserva = new Date(r.fecha);
          return fechaReserva >= startOfMonth && fechaReserva <= endOfMonth && fechaReserva < now; // Solo contar si la reserva ya ha pasado
        })
        .map(r => new Date(r.fecha).toDateString()) // Convertir a string para obtener solo la fecha
    );

    const visitasEsteMes = uniqueDays.size; // Contar los días únicos

    const clienteInfo = {
      id: usuario.id,
      nombre: usuario.nombre,
      carnetIdentidad: usuario.carnetIdentidad,
      foto: usuario.foto,
      telefono: usuario.telefono,
      rol: usuario.rol,
      sexo: usuario.sexo,
      email: usuario.email,
      instagram: usuario.instagram,
      visitasEsteMes,
      reservas: usuario.reservasCliente.map(r => ({
        id: r.id,
        fecha: r.fecha,
        estado: r.estado,
        entrenador: r.entrenador ? {
          id: r.entrenador.id,
          nombre: r.entrenador.usuario.nombre,
        } : null,
      })),
      membresia: usuario.membresiaActual ? {
        id: usuario.membresiaActual.id,
        tipo: usuario.membresiaActual.tipo,
        estadoPago: usuario.membresiaActual.estadoPago,
        fechaInicio: usuario.membresiaActual.fechaInicio,
        fechaFin: usuario.membresiaActual.fechaFin,
      } : null,
      membresias: usuario.membresias.map(m => ({
        id: m.id,
        tipo: m.tipo,
        estadoPago: m.estadoPago,
        fechaInicio: m.fechaInicio,
        fechaFin: m.fechaFin,
      })),
      entrenadorAsignado: usuario.entrenadorAsignado ? {
        id: usuario.entrenadorAsignado.id,
        nombre: usuario.entrenadorAsignado.nombre,
        telefono: usuario.entrenadorAsignado.telefono,
      } : null,
      checkIns: usuario.checkIns.map(c => ({
        id: c.id,
        fecha: c.fecha,
        tipo: c.tipo,
        metodo: c.metodo,
      })),
      pagos: usuario.pagos.map(p => ({
        id: p.id,
        monto: Number(p.monto),
        moneda: p.moneda,
        metodoPago: p.metodoPago,
        fechaPago: p.fechaPago,
        referencia: p.referencia,
      })),
    };

    return NextResponse.json(clienteInfo);
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { clienteId, fecha } = await request.json();

  try {
    const parsedDate = new Date(fecha);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Fecha inválida');
    }

    // Validar que el cliente exista
    const cliente = await prisma.usuario.findUnique({
      where: { id: parseInt(clienteId) },
      include: {
        entrenadorAsignado: {
          include: {
            entrenador: true // Incluye la relación 'entrenador' dentro de 'entrenadorAsignado'
          }
        }
      },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Validar que el entrenador asignado exista
    const entrenadorId = cliente.entrenadorAsignado?.entrenador?.id || null;
    if (entrenadorId) {
      const entrenador = await prisma.entrenador.findUnique({
        where: { id: entrenadorId },
      });
    }

    const newReserva = await prisma.reserva.create({
      data: {
        clienteId: parseInt(clienteId),
        fecha: parsedDate,
        estado: 'ACTIVA',
        entrenadorId: entrenadorId,
      },
    });

    return NextResponse.json({ reserva: newReserva });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Error creating reservation' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const reservaId = parseInt(params.id);

  if (isNaN(reservaId)) {
    return NextResponse.json({ error: 'ID de reserva inválido' }, { status: 400 });
  }

  try {
    // Cancelar la reserva
    const updatedReservation = await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado: 'CANCELADA' },
    });

    return NextResponse.json({ message: 'Reserva cancelada con éxito', reserva: updatedReservation });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    return NextResponse.json({ error: 'Error al eliminar la reserva' }, { status: 500 });
  }
}
