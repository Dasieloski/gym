import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'list'

    if (type === 'leaderboard') {
      const limit = parseInt(searchParams.get('limit') || '20')
      const top = await prisma.punto.groupBy({
        by: ['usuarioId'],
        _sum: { puntos: true },
        orderBy: { _sum: { puntos: 'desc' } },
        take: limit,
      })

      const userIds = top.map(t => t.usuarioId)
      const users = await prisma.usuario.findMany({
        where: { id: { in: userIds } },
        select: { id: true, nombre: true, foto: true }
      })
      const userMap = Object.fromEntries(users.map(u => [u.id, u]))

      const leaderboard = top.map((t, i) => ({
        rank: i + 1,
        usuarioId: t.usuarioId,
        nombre: userMap[t.usuarioId]?.nombre || 'Desconocido',
        foto: userMap[t.usuarioId]?.foto || null,
        totalPuntos: t._sum.puntos || 0
      }))

      return NextResponse.json({ leaderboard })
    }

    if (userId) {
      const puntos = await prisma.punto.findMany({
        where: { usuarioId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      const total = await prisma.punto.aggregate({
        where: { usuarioId: parseInt(userId) },
        _sum: { puntos: true }
      })
      return NextResponse.json({ puntos, total: total._sum.puntos || 0 })
    }

    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching puntos:', error)
    return NextResponse.json({ error: 'Error al obtener puntos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { usuarioId, puntos, concepto, referencia } = await req.json()

    if (!usuarioId || !puntos || !concepto) {
      return NextResponse.json({ error: 'usuarioId, puntos y concepto son requeridos' }, { status: 400 })
    }

    const punto = await prisma.punto.create({
      data: {
        usuarioId: parseInt(usuarioId),
        puntos: parseInt(puntos),
        concepto,
        referencia
      }
    })

    return NextResponse.json(punto, { status: 201 })
  } catch (error) {
    console.error('Error creating punto:', error)
    return NextResponse.json({ error: 'Error al crear punto' }, { status: 500 })
  }
}
