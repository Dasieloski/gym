import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (id) {
      const desafio = await prisma.desafio.findUnique({
        where: { id: parseInt(id) },
        include: {
          participantes: {
            include: {
              usuario: { select: { id: true, nombre: true, foto: true } }
            }
          }
        }
      })
      return NextResponse.json({ desafio })
    }

    const where: Record<string, unknown> = {}
    if (userId) {
      where.participantes = { some: { usuarioId: parseInt(userId) } }
    }

    const desafios = await prisma.desafio.findMany({
      where: { activo: true, ...where },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participantes: true } },
        participantes: userId ? {
          where: { usuarioId: parseInt(userId) },
          select: { progreso: true, completado: true }
        } : false
      }
    })

    return NextResponse.json({ desafios })
  } catch (error) {
    console.error('Error fetching desafios:', error)
    return NextResponse.json({ error: 'Error al obtener desafíos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'join') {
      const { desafioId, usuarioId } = body
      const existing = await prisma.desafioUsuario.findUnique({
        where: { desafioId_usuarioId: { desafioId: parseInt(desafioId), usuarioId: parseInt(usuarioId) } }
      })
      if (existing) {
        return NextResponse.json({ error: 'Ya estás inscrito en este desafío' }, { status: 400 })
      }
      const participation = await prisma.desafioUsuario.create({
        data: { desafioId: parseInt(desafioId), usuarioId: parseInt(usuarioId) }
      })
      return NextResponse.json(participation, { status: 201 })
    }

    if (action === 'progress') {
      const { desafioId, usuarioId, progreso } = body
      const updated = await prisma.desafioUsuario.update({
        where: { desafioId_usuarioId: { desafioId: parseInt(desafioId), usuarioId: parseInt(usuarioId) } },
        data: { progreso: parseInt(progreso) }
      })

      const desafio = await prisma.desafio.findUnique({ where: { id: parseInt(desafioId) } })
      if (desafio && updated.progreso >= desafio.meta && !updated.completado) {
        await prisma.desafioUsuario.update({
          where: { id: updated.id },
          data: { completado: true, fechaCompletado: new Date() }
        })

        if (desafio.recompensa > 0) {
          await prisma.punto.create({
            data: {
              usuarioId: parseInt(usuarioId),
              puntos: desafio.recompensa,
              concepto: `Completado: ${desafio.nombre}`,
              referencia: `CHALLENGE_${desafioId}`
            }
          })
        }
      }

      return NextResponse.json(updated)
    }

    const { nombre, descripcion, tipo, meta, diasDuracion, recompensa } = body
    if (!nombre || !meta) {
      return NextResponse.json({ error: 'nombre y meta requeridos' }, { status: 400 })
    }

    const desafio = await prisma.desafio.create({
      data: {
        nombre,
        descripcion,
        tipo: tipo || 'ASISTENCIA',
        meta: parseInt(meta),
        diasDuracion: parseInt(diasDuracion || '30'),
        recompensa: parseInt(recompensa || '0')
      }
    })

    return NextResponse.json(desafio, { status: 201 })
  } catch (error) {
    console.error('Error managing desafios:', error)
    return NextResponse.json({ error: 'Error al gestionar desafío' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    }

    await prisma.desafioUsuario.deleteMany({ where: { desafioId: parseInt(id) } })
    await prisma.desafio.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Desafío eliminado' })
  } catch (error) {
    console.error('Error deleting desafio:', error)
    return NextResponse.json({ error: 'Error al eliminar desafío' }, { status: 500 })
  }
}
