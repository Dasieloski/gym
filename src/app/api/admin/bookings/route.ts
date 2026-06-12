import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const bookings = await prisma.reserva.findMany({
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        foto: true
                    }
                },
                entrenador: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fecha: 'asc',
            },
        });

        // No formatear la fecha
        const formattedBookings = bookings.map(booking => ({
            ...booking,
            entrenadorNombre: booking.entrenador?.usuario.nombre || 'No asignado'
        }));

        return NextResponse.json(formattedBookings || []);
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        return NextResponse.json({ error: 'Error al obtener las reservas' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    // Lógica para eliminar la reserva con el ID proporcionado
    // Por ejemplo, eliminar de la base de datos

    return NextResponse.json({ message: 'Reserva eliminada con éxito' }, { status: 200 });
}