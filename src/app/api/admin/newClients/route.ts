import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('GET /api/admin/newClients - Iniciando');
    const clientesEspera = await prisma.usuario.findMany({
      where: {
        rol: 'CLIENTEESPERA'
      },
      select: {
        id: true,
        nombre: true,
        username: true,
        carnetIdentidad: true,
        telefono: true,
        rol: true,
        foto: true,
        sexo: true,
        email: true,
        instagram: true,
        comoConocio: true,
        fechaNacimiento: true,
      }
    });
    console.log('GET /api/admin/newClients - Clientes en espera:', clientesEspera);

    return NextResponse.json(clientesEspera);
  } catch (error) {
    console.error('Error al obtener los clientes en espera:', error);
    return NextResponse.json({ error: 'Error al obtener los clientes en espera' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    console.log('PATCH /api/admin/newClients - Iniciando');
    const body = await req.json();
    console.log('PATCH /api/admin/newClients - Datos recibidos:', body);

    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'El id es requerido' }, { status: 400 });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { rol: 'CLIENTE' },
    });
    console.log('PATCH /api/admin/newClients - Usuario actualizado:', updatedUser);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar el rol del usuario' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const clienteId = idParam ? parseInt(idParam) : NaN;

    if (isNaN(clienteId)) {
      return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: clienteId },
      select: { foto: true },
    });

    await prisma.membresia.deleteMany({
      where: { clienteId: clienteId },
    });

    await prisma.historial.deleteMany({
      where: { usuarioId: clienteId },
    });

    await prisma.registroPeso.deleteMany({
      where: { usuarioId: clienteId },
    });

    await prisma.reserva.deleteMany({
      where: { clienteId: clienteId },
    });

    const deletedUsuario = await prisma.usuario.delete({
      where: { id: clienteId },
    });

    if (usuario?.foto && usuario.foto.startsWith('/uploads/')) {
      try {
        const filepath = join(process.cwd(), 'public', usuario.foto);
        await unlink(filepath);
      } catch (e) {
        console.error('Error al eliminar foto:', e);
      }
    }

    return NextResponse.json({ message: 'Cliente eliminado con éxito', usuario: deletedUsuario });
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    return NextResponse.json({ error: 'Error al eliminar el cliente' }, { status: 500 });
  }
}