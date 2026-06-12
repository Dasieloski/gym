import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');

    const where = clienteId ? { clienteId: parseInt(clienteId) } : {};

    const rutinas = await prisma.rutina.findMany({
      where,
      include: {
        ejercicios: { orderBy: { orden: 'asc' } },
        cliente: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rutinas);
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { nombre, descripcion, clienteId, creadorId, ejercicios } = await req.json();

    if (!nombre || !clienteId) {
      return NextResponse.json({ error: 'Nombre y cliente son requeridos' }, { status: 400 });
    }

    const rutina = await prisma.rutina.create({
      data: {
        nombre,
        descripcion,
        clienteId,
        creadorId: creadorId || parseInt(token.sub!),
        ejercicios: ejercicios?.length > 0 ? {
          create: ejercicios.map((e: { nombre: string; descripcion?: string; series?: number; repeticiones?: number; peso?: number; diaSemana?: string; orden?: number; notas?: string }) => ({
            nombre: e.nombre,
            descripcion: e.descripcion,
            series: e.series || 3,
            repeticiones: e.repeticiones || 10,
            peso: e.peso,
            diaSemana: e.diaSemana,
            orden: e.orden || 0,
            notas: e.notas,
          })),
        } : undefined,
      },
      include: {
        ejercicios: { orderBy: { orden: 'asc' } },
        cliente: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json(rutina);
  } catch (error) {
    console.error('Error al crear rutina:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { id, nombre, descripcion, activa, ejercicios } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (activa !== undefined) updateData.activa = activa;

    const rutina = await prisma.rutina.update({
      where: { id },
      data: {
        ...updateData,
        ejercicios: ejercicios ? {
          deleteMany: {},
          create: ejercicios.map((e: { nombre: string; descripcion?: string; series?: number; repeticiones?: number; peso?: number; diaSemana?: string; orden?: number; notas?: string }) => ({
            nombre: e.nombre,
            descripcion: e.descripcion,
            series: e.series || 3,
            repeticiones: e.repeticiones || 10,
            peso: e.peso,
            diaSemana: e.diaSemana,
            orden: e.orden || 0,
            notas: e.notas,
          })),
        } : undefined,
      },
      include: {
        ejercicios: { orderBy: { orden: 'asc' } },
        cliente: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json(rutina);
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token?.rol !== 'ADMIN') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.rutina.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
