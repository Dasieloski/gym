import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub || token.rol !== 'ENTRENADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const entrenadorId = parseInt(token.sub);

    const { searchParams } = new URL(req.url);
    const days = searchParams.get('days');

    let where: Record<string, unknown> = { entrenadorId };
    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(days));
      where.fechaPago = { gte: since };
    }

    const pagos = await prisma.pagoEntrenador.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaPago: 'desc' },
    });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub || token.rol !== 'ENTRENADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const entrenadorId = parseInt(token.sub);
    const { clienteId, monto, moneda, metodoPago, notas } = await req.json();

    if (!clienteId || !monto) {
      return NextResponse.json({ error: 'Cliente y monto requeridos' }, { status: 400 });
    }

    const pago = await prisma.pagoEntrenador.create({
      data: {
        entrenadorId,
        clienteId,
        monto: parseFloat(monto),
        moneda: moneda || 'CUP',
        metodoPago: metodoPago || 'EFECTIVO',
        notas,
      },
      include: {
        cliente: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json(pago, { status: 201 });
  } catch (error) {
    console.error('Error al crear pago:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub || token.rol !== 'ENTRENADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const entrenadorId = parseInt(token.sub);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const pago = await prisma.pagoEntrenador.findFirst({
      where: { id: parseInt(id), entrenadorId },
    });
    if (!pago) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });

    await prisma.pagoEntrenador.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
