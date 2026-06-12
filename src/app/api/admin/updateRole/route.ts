import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: NextRequest) {
    try {
        const { id, rol } = await req.json();

        if (!id || !rol) {
            return NextResponse.json({ error: 'El id y el rol son requeridos' }, { status: 400 });
        }

        const updatedUser = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { rol },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error detallado al actualizar el rol del usuario:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: `Error al actualizar el rol del usuario: ${errorMessage}` }, { status: 500 });
    }
}