import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''
    const userId = searchParams.get('userId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { accion: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { usuario: { nombre: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (action) {
      where.accion = { contains: action, mode: 'insensitive' }
    }

    if (userId) {
      where.usuarioId = parseInt(userId)
    }

    if (dateFrom || dateTo) {
      where.fecha = {}
      if (dateFrom) where.fecha.gte = new Date(dateFrom)
      if (dateTo) where.fecha.lte = new Date(dateTo + 'T23:59:59')
    }

    const [historiales, total] = await Promise.all([
      prisma.historial.findMany({
        where,
        include: {
          usuario: { select: { id: true, nombre: true, rol: true, foto: true } },
          entrenador: { include: { usuario: { select: { nombre: true } } } },
          membresia: { select: { id: true, tipo: true } },
          reserva: { select: { id: true, fecha: true, estado: true } }
        },
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.historial.count({ where })
    ])

    const formattedLogs = historiales.map(h => ({
      id: h.id,
      accion: h.accion,
      descripcion: h.descripcion,
      fecha: dayjs(h.fecha).format('DD/MM/YYYY HH:mm'),
      fechaISO: h.fecha,
      usuario: {
        id: h.usuario.id,
        nombre: h.usuario.nombre,
        rol: h.usuario.rol,
        foto: h.usuario.foto
      },
      entrenador: h.entrenador?.usuario.nombre || null,
      membresia: h.membresia ? `${h.membresia.tipo} (#${h.membresia.id})` : null,
      reserva: h.reserva ? `${dayjs(h.reserva.fecha).format('DD/MM/YYYY')} - ${h.reserva.estado}` : null
    }))

    const actions = await prisma.historial.findMany({
      select: { accion: true },
      distinct: ['accion']
    })

    const users = await prisma.usuario.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json({
      logs: formattedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      actions: actions.map(a => a.accion),
      users
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Error al obtener los logs' }, { status: 500 })
  }
}
