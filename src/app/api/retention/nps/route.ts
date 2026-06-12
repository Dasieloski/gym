import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const encuestas = await prisma.encuestaNPS.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        usuario: { select: { id: true, nombre: true, foto: true } }
      }
    })

    const total = encuestas.length
    const avg = total > 0
      ? Math.round(encuestas.reduce((sum, e) => sum + e.puntuacion, 0) / total * 10) / 10
      : 0

    const promoters = encuestas.filter(e => e.puntuacion >= 9).length
    const detractors = encuestas.filter(e => e.puntuacion <= 6).length
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0

    return NextResponse.json({
      encuestas,
      total,
      promedio: avg,
      nps,
      promoters,
      detractors,
      passives: total - promoters - detractors
    })
  } catch (error) {
    console.error('Error fetching NPS:', error)
    return NextResponse.json({ error: 'Error al obtener NPS' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { usuarioId, puntuacion, comentario } = await req.json()

    if (!usuarioId || !puntuacion) {
      return NextResponse.json({ error: 'usuarioId y puntuacion requeridos' }, { status: 400 })
    }

    if (puntuacion < 0 || puntuacion > 10) {
      return NextResponse.json({ error: 'puntuacion debe ser entre 0 y 10' }, { status: 400 })
    }

    const encuesta = await prisma.encuestaNPS.create({
      data: {
        usuarioId: parseInt(usuarioId),
        puntuacion: parseInt(puntuacion),
        comentario
      }
    })

    return NextResponse.json(encuesta, { status: 201 })
  } catch (error) {
    console.error('Error creating NPS:', error)
    return NextResponse.json({ error: 'Error al crear encuesta NPS' }, { status: 500 })
  }
}
