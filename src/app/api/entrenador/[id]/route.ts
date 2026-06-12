import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        // Obtener los clientes asignados al entrenador con el id proporcionado
        const clients = await prisma.usuario.findMany({
            where: {
                entrenadorAsignadoId: parseInt(id),
            },
            select: {
                id: true,
                nombre: true,
                carnetIdentidad: true,
                telefono: true,
                rol: true,
                foto: true,
                entrenador: {
                    select: {
                        id: true,
                    },
                },
                membresiaActual: {
                    select: {
                        id: true,
                        tipo: true,
                        fechaInicio: true,
                        fechaFin: true,
                        estadoPago: true,
                    },
                },
                membresias: {
                    select: {
                        id: true,
                        tipo: true,
                        fechaInicio: true,
                        fechaFin: true,
                        estadoPago: true,
                    },
                },
                reservasCliente: {
                    where: {
                        estado: 'ACTIVA',
                    },
                    select: {
                        id: true,
                        fecha: true,
                        estado: true,
                    },
                },
            },
        });

        // Calcular los campos adicionales
        const clientsWithCalculatedFields = clients.map(client => {
            const lastPayment = client.membresiaActual?.fechaInicio.toISOString().split('T')[0] || null;
            const nextPayment = client.membresiaActual?.fechaFin.toISOString().split('T')[0] || null;
            const daysUntilPayment = client.membresiaActual ? Math.ceil((new Date(client.membresiaActual.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

            return {
                ...client,
                lastPayment,
                nextPayment,
                daysUntilPayment,
            };
        });

        return NextResponse.json(clientsWithCalculatedFields);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { clientId, paid, newMembershipType } = await request.json();

    try {
        const client = await prisma.usuario.findUnique({
            where: { id: clientId },
            include: { membresiaActual: true },
        });

        if (!client) {
            throw new Error('Client not found');
        }

        const today = new Date();
        const nextPaymentDate = new Date(today.setMonth(today.getMonth() + (newMembershipType === 'ANUAL' ? 12 : newMembershipType === 'TRIMESTRAL' ? 3 : 1)));

        // Usar transacción para garantizar atomicidad
        const result = await prisma.$transaction(async (tx) => {
            // Mover la membresía actual al historial (disconnect)
            if (client.membresiaActual) {
                await tx.membresia.update({
                    where: { id: client.membresiaActual.id },
                    data: {
                        usuarioActual: {
                            disconnect: true,
                        },
                    },
                });
            }

            // Crear nueva membresía
            const newMembership = await tx.membresia.create({
                data: {
                    tipo: newMembershipType.toUpperCase() as 'ANUAL' | 'TRIMESTRAL' | 'MENSUAL',
                    fechaInicio: new Date(),
                    fechaFin: nextPaymentDate,
                    estadoPago: 'PAGADO',
                    cliente: {
                        connect: { id: clientId },
                    },
                },
            });

            // Calcular los campos adicionales
            const lastPayment = paid ? new Date().toISOString().split('T')[0] : client.membresiaActual?.fechaInicio.toISOString().split('T')[0] || null;
            const nextPayment = paid ? nextPaymentDate.toISOString().split('T')[0] : client.membresiaActual?.fechaFin.toISOString().split('T')[0] || null;
            const daysUntilPayment = paid ? Math.ceil((nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : client.membresiaActual ? Math.ceil((new Date(client.membresiaActual.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

            // Actualizar el cliente con la nueva membresía
            const updatedClient = await tx.usuario.update({
                where: { id: clientId },
                data: {
                    membresiaActualId: newMembership.id,
                },
                include: {
                    membresiaActual: true,
                    membresias: true,
                    reservasCliente: true,
                },
            });

            return {
                updatedClient,
                lastPayment,
                nextPayment,
                daysUntilPayment,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating membership:', error);
        return NextResponse.json({ error: 'Error updating membership' }, { status: 500 });
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
        console.error('Error al cancelar la reserva:', error);
        return NextResponse.json({ error: 'Error al cancelar la reserva' }, { status: 500 });
    }
}