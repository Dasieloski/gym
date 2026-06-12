import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importar el singleton

// Forzar comportamiento dinámico y desactivar la revalidación
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('GET /api/admin/roles - Iniciando');
    const usuariosroles = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        rol: true,
         foto: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
    console.log('Usuarios obtenidos:', usuariosroles);
    const response = NextResponse.json(usuariosroles);
    response.headers.set('Cache-Control', 'no-store'); // Desactivar la caché
    return response;
  } catch (error: any) {
    console.error('Error al obtener los datos:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}

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
    console.error('Error al actualizar el rol del usuario:', error as Error);
    return NextResponse.json({ error: `Error al actualizar el rol del usuario: ${(error as Error).message}` }, { status: 500 });
  }
}