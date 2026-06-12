import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');
    const categoria = searchParams.get('categoria');

    const where: any = {};
    if (clienteId) where.clienteId = parseInt(clienteId);
    if (categoria && categoria !== 'todas') where.categoria = categoria;

    const notas = await prisma.notaCliente.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true, foto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notas);
  } catch (error) {
    console.error('Error fetching notas:', error);
    return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { contenido, categoria, clienteId, creadoPor } = await req.json();
    if (!contenido || !categoria || !clienteId) {
      return NextResponse.json({ error: 'contenido, categoria y clienteId son requeridos' }, { status: 400 });
    }
    const nota = await prisma.notaCliente.create({
      data: { contenido, categoria, clienteId: parseInt(clienteId), creadoPor: parseInt(creadoPor) },
      include: { cliente: { select: { id: true, nombre: true, foto: true } } },
    });
    return NextResponse.json(nota, { status: 201 });
  } catch (error) {
    console.error('Error creating nota:', error);
    return NextResponse.json({ error: 'Error al crear nota' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    await prisma.notaCliente.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Nota eliminada' });
  } catch (error) {
    console.error('Error deleting nota:', error);
    return NextResponse.json({ error: 'Error al eliminar nota' }, { status: 500 });
  }
}
