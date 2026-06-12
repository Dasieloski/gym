import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany({
      where: {
        fecha: {
          gte: new Date(), // Filtra reservas futuras
        },
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            carnetIdentidad: true,
             foto: true,
          },
        },
        entrenador: {
          select: {
            id: true,
            usuario: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    return NextResponse.json({ reservas });
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    return NextResponse.json({ error: 'Error al obtener las reservas' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      throw new Error('El id es requerido');
    }

    const reservaEliminada = await prisma.reserva.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(reservaEliminada, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    return NextResponse.json({ error: 'Error al eliminar la reserva' }, { status: 500 });
  }
}