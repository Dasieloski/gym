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
    const userId = parseInt(token.sub);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { entrenadorAsignadoId: userId };
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { carnetIdentidad: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clientes, totalCount] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
        skip,
        take: limit,
      }),
      prisma.usuario.count({ where }),
    ]);

    return NextResponse.json({ 
      clientes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
