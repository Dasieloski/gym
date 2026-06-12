import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get('categoria');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    const where: any = {};
    if (categoria && categoria !== 'todas') where.categoria = categoria;
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(hasta + 'T23:59:59.999Z');
    }

    const gastos = await prisma.gasto.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });

    const totales = gastos.reduce((acc: any, g: any) => {
      if (!acc[g.moneda]) acc[g.moneda] = 0;
      acc[g.moneda] += Number(g.monto);
      return acc;
    }, {});

    return NextResponse.json({ gastos, totales, total: gastos.length });
  } catch (error) {
    console.error('Error fetching gastos:', error);
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoria, descripcion, monto, moneda, fecha, metodoPago, registradoPor, recurrente, periodicidad } = await req.json();
    if (!categoria || !descripcion || !monto) {
      return NextResponse.json({ error: 'categoria, descripcion y monto son requeridos' }, { status: 400 });
    }
    const gasto = await prisma.gasto.create({
      data: {
        categoria, descripcion, monto: parseFloat(monto),
        moneda: moneda || 'CUP',
        fecha: fecha ? new Date(fecha) : new Date(),
        metodoPago: metodoPago || null,
        registradoPor: parseInt(registradoPor),
        recurrente: recurrente || false,
        periodicidad: periodicidad || null,
      },
    });
    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    console.error('Error creating gasto:', error);
    return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, categoria, descripcion, monto, moneda, fecha, metodoPago, recurrente, periodicidad } = await req.json();
    const gasto = await prisma.gasto.update({
      where: { id: parseInt(id) },
      data: { categoria, descripcion, monto: parseFloat(monto), moneda, fecha: new Date(fecha), metodoPago, recurrente, periodicidad },
    });
    return NextResponse.json(gasto);
  } catch (error) {
    console.error('Error updating gasto:', error);
    return NextResponse.json({ error: 'Error al actualizar gasto' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    await prisma.gasto.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Gasto eliminado' });
  } catch (error) {
    console.error('Error deleting gasto:', error);
    return NextResponse.json({ error: 'Error al eliminar gasto' }, { status: 500 });
  }
}
