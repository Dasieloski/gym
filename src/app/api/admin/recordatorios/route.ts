import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dias = parseInt(searchParams.get('dias') || '5');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + dias);

    const vencidas = new Date(hoy);
    vencidas.setDate(vencidas.getDate() - 1);

    const memberships = await prisma.membresia.findMany({
      where: {
        fechaFin: {
          gte: vencidas,
          lte: limite,
        },
        estadoPago: 'PAGADO',
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            foto: true,
          },
        },
      },
      orderBy: { fechaFin: 'asc' },
    });

    const result = memberships.map((m) => {
      const diasRestantes = Math.ceil(
        (new Date(m.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: m.id,
        clienteId: m.cliente.id,
        clienteNombre: m.cliente.nombre,
        clienteTelefono: m.cliente.telefono,
        clienteFoto: m.cliente.foto,
        tipo: m.tipo,
        fechaInicio: m.fechaInicio,
        fechaFin: m.fechaFin,
        diasRestantes,
        estado: diasRestantes < 0 ? 'VENCIDA' : diasRestantes <= 1 ? 'CRITICO' : 'PRONTO',
      };
    });

    // Auto-crear notificaciones para clientes con membresías próximas a vencer
    for (const m of memberships) {
      const diasRestantes = Math.ceil(
        (new Date(m.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const titulo = diasRestantes < 0
        ? 'Membresía vencida'
        : diasRestantes <= 3
        ? 'Membresía por vencer'
        : 'Recordatorio de membresía';

      const mensaje = diasRestantes < 0
        ? `Tu membresía ${m.tipo} venció el ${new Date(m.fechaFin).toLocaleDateString('es-ES')}. Renueva para seguir entrenando.`
        : `Tu membresía ${m.tipo} vence en ${diasRestantes} día(s) (${new Date(m.fechaFin).toLocaleDateString('es-ES')}).`;

      // Verificar si ya existe una notificación similar en las últimas 24h
      const yaNotificado = await prisma.notificacion.findFirst({
        where: {
          usuarioId: m.cliente.id,
          titulo,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!yaNotificado) {
        await prisma.notificacion.create({
          data: {
            usuarioId: m.cliente.id,
            titulo,
            mensaje,
            tipo: diasRestantes < 0 ? 'VENCIMIENTO' : 'RECORDATORIO',
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      recordatorios: result,
      total: result.length,
      fecha: hoy.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching recordatorios:', error);
    return NextResponse.json({ error: 'Error al obtener recordatorios' }, { status: 500 });
  }
}
