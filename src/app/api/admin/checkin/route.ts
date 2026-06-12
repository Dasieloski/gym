import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CHECKIN_DEBOUNCE_MS = 30000; // 30 segundos

export async function POST(req: NextRequest) {
  try {
    const { clienteId, tipo, metodo, pin } = await req.json();
    if (!clienteId) {
      return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 });
    }
    const cliente = await prisma.usuario.findUnique({
      where: { id: parseInt(clienteId) },
      select: { id: true, nombre: true, membresiaActual: { select: { fechaFin: true } } },
    });
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    if (tipo === 'ENTRADA') {
      const membresiaVencida = cliente.membresiaActual && new Date(cliente.membresiaActual.fechaFin) < new Date();
      if (!cliente.membresiaActual || membresiaVencida) {
        return NextResponse.json({ error: 'Cliente sin membresia activa', warning: true }, { status: 403 });
      }
    }

    // Protección contra duplicados: verificar si ya hay un check-in reciente del mismo tipo
    const recentCheckin = await prisma.checkIn.findFirst({
      where: {
        clienteId: parseInt(clienteId),
        tipo: tipo || 'ENTRADA',
        fecha: {
          gte: new Date(Date.now() - CHECKIN_DEBOUNCE_MS),
        },
      },
      orderBy: { fecha: 'desc' },
    });

    if (recentCheckin) {
      return NextResponse.json({ 
        error: 'Check-in duplicado detectado', 
        duplicate: true,
        lastCheckin: recentCheckin 
      }, { status: 409 });
    }

    const checkin = await prisma.checkIn.create({
      data: {
        clienteId: parseInt(clienteId),
        tipo: tipo || 'ENTRADA',
        metodo: metodo || 'MANUAL',
        pin: pin || null,
      },
      include: { cliente: { select: { id: true, nombre: true } } },
    });
    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    console.error('Error creating checkin:', error);
    return NextResponse.json({ error: 'Error al registrar checkin' }, { status: 500 });
  }
}
