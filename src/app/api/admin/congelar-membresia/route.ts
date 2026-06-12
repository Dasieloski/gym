import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { membresiaId, fechaInicio, fechaFin, motivo, activa } = await req.json();

    if (activa === true) {
      const congelacion = await prisma.congelacionMembresia.create({
        data: {
          membresiaId: parseInt(membresiaId),
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          motivo,
          activa: true,
        },
      });
      await prisma.membresia.update({
        where: { id: parseInt(membresiaId) },
        data: { congelada: true },
      });
      return NextResponse.json(congelacion, { status: 201 });
    } else {
      await prisma.congelacionMembresia.updateMany({
        where: { membresiaId: parseInt(membresiaId), activa: true },
        data: { activa: false },
      });
      await prisma.membresia.update({
        where: { id: parseInt(membresiaId) },
        data: { congelada: false },
      });
      return NextResponse.json({ message: 'Membresia descongelada' });
    }
  } catch (error) {
    console.error('Error managing freeze:', error);
    return NextResponse.json({ error: 'Error al gestionar congelacion' }, { status: 500 });
  }
}
