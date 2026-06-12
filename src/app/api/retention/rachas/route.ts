import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const racha = await prisma.racha.findUnique({
        where: { usuarioId: parseInt(userId) }
      })
      return NextResponse.json({ racha })
    }

    const top = await prisma.racha.findMany({
      orderBy: { rachaActual: 'desc' },
      take: 20,
      include: {
        usuario: { select: { id: true, nombre: true, foto: true } }
      }
    })

    const leaderboard = top.map((r, i) => ({
      rank: i + 1,
      usuarioId: r.usuarioId,
      nombre: r.usuario.nombre,
      foto: r.usuario.foto,
      rachaActual: r.rachaActual,
      rachaMaxima: r.rachaMaxima,
      ultimoCheckIn: r.ultimoCheckIn
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching rachas:', error)
    return NextResponse.json({ error: 'Error al obtener rachas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { usuarioId } = await req.json()

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId requerido' }, { status: 400 })
    }

    const now = dayjs()
    const existing = await prisma.racha.findUnique({
      where: { usuarioId: parseInt(usuarioId) }
    })

    if (!existing) {
      const racha = await prisma.racha.create({
        data: {
          usuarioId: parseInt(usuarioId),
          rachaActual: 1,
          rachaMaxima: 1,
          ultimoCheckIn: now.toDate()
        }
      })
      return NextResponse.json(racha, { status: 201 })
    }

    const lastCheckIn = existing.ultimoCheckIn ? dayjs(existing.ultimoCheckIn) : null
    const diffInHours = lastCheckIn ? now.diff(lastCheckIn, 'hour') : 999

    let nuevaRachaActual = existing.rachaActual
    if (lastCheckIn && now.isSame(lastCheckIn, 'day')) {
      return NextResponse.json({ racha: existing, message: 'Ya tiene check-in hoy' })
    } else if (diffInHours <= 48) {
      nuevaRachaActual = existing.rachaActual + 1
    } else {
      nuevaRachaActual = 1
    }

    const nuevaRachaMaxima = Math.max(existing.rachaMaxima, nuevaRachaActual)

    const racha = await prisma.racha.update({
      where: { usuarioId: parseInt(usuarioId) },
      data: {
        rachaActual: nuevaRachaActual,
        rachaMaxima: nuevaRachaMaxima,
        ultimoCheckIn: now.toDate()
      }
    })

    if (nuevaRachaActual > 0 && nuevaRachaActual % 7 === 0) {
      await prisma.punto.create({
        data: {
          usuarioId: parseInt(usuarioId),
          puntos: 50,
          concepto: `Racha de ${nuevaRachaActual} días`,
          referencia: 'STREAK_BONUS'
        }
      })
    }

    return NextResponse.json({ racha, bonus: nuevaRachaActual % 7 === 0 })
  } catch (error) {
    console.error('Error updating racha:', error)
    return NextResponse.json({ error: 'Error al actualizar racha' }, { status: 500 })
  }
}
