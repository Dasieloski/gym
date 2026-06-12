import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub || token.rol !== 'ENTRENADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const entrenadorId = parseInt(token.sub);

    const clave = `precio_entrenador_${entrenadorId}`;
    let config = await prisma.configuracion.findUnique({ where: { clave } });

    if (!config) {
      config = await prisma.configuracion.create({
        data: {
          clave,
          valor: '0',
          descripcion: `Precio mensual del entrenador ${entrenadorId}`,
        },
      });
    }

    return NextResponse.json({ precio: parseFloat(config.valor), moneda: 'CUP' });
  } catch (error) {
    console.error('Error al obtener precio:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.sub || token.rol !== 'ENTRENADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const entrenadorId = parseInt(token.sub);
    const { precio } = await req.json();

    if (precio === undefined || precio < 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    const clave = `precio_entrenador_${entrenadorId}`;
    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor: precio.toString() },
      create: {
        clave,
        valor: precio.toString(),
        descripcion: `Precio mensual del entrenador ${entrenadorId}`,
      },
    });

    return NextResponse.json({ precio: parseFloat(precio), moneda: 'CUP' });
  } catch (error) {
    console.error('Error al actualizar precio:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
