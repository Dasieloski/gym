import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');

    const where: any = {};
    if (clienteId) where.clienteId = parseInt(clienteId);

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
        membresia: { select: { id: true, tipo: true } },
      },
      orderBy: { fechaPago: 'desc' },
    });
    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error fetching pagos:', error);
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clienteId, membresiaId, monto, moneda, metodoPago, referencia, notas } = await req.json();
    if (!clienteId || !monto || !metodoPago) {
      return NextResponse.json({ error: 'clienteId, monto y metodoPago son requeridos' }, { status: 400 });
    }
    const pago = await prisma.pago.create({
      data: {
        clienteId: parseInt(clienteId),
        membresiaId: membresiaId ? parseInt(membresiaId) : null,
        monto: parseFloat(monto),
        moneda: moneda || 'CUP',
        metodoPago,
        referencia: referencia || null,
        notas: notas || null,
      },
      include: { cliente: { select: { id: true, nombre: true } } },
    });
    return NextResponse.json(pago, { status: 201 });
  } catch (error) {
    console.error('Error creating pago:', error);
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 });
  }
}
