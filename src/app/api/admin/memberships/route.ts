import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Forzar comportamiento dinámico y desactivar la revalidación
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const clients = await prisma.usuario.findMany({
            where: {
                rol: 'CLIENTE', // Asegúrate de filtrar solo los clientes
            },
            include: {
                membresiaActual: true,
                membresias: true,
            },
        });
        const response = NextResponse.json(clients);
        response.headers.set('Cache-Control', 'no-store'); // Desactivar la caché
        return response;
    } catch (error) {
        console.error('Error fetching memberships:', error);
        return NextResponse.json({ error: 'Error fetching memberships' }, { status: 500 });
    }
}