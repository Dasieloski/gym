import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PRECIOS_DEFAULT: Record<string, number> = { MENSUAL: 2000, TRIMESTRAL: 10000, ANUAL: 20000 }

async function getPrecios() {
  const configs = await prisma.configuracion.findMany({
    where: { clave: { in: ['PRECIO_MENSUAL', 'PRECIO_TRIMESTRAL', 'PRECIO_ANUAL'] } }
  })
  configs.forEach(c => {
    const tipo = c.clave.replace('PRECIO_', '')
    if (c.valor) PRECIOS_DEFAULT[tipo] = parseInt(c.valor) || PRECIOS_DEFAULT[tipo]
  })
  return PRECIOS_DEFAULT
}

async function calcularActual(tipo: string, precios: Record<string, number>): Promise<number> {
  switch (tipo) {
    case 'CLIENTES': {
      return prisma.usuario.count({ where: { rol: 'CLIENTE' } })
    }
    case 'INGRESOS_MENSUAL': {
      const inicioMes = dayjs().startOf('month').toDate()
      const memberships = await prisma.membresia.findMany({
        where: { estadoPago: 'PAGADO', createdAt: { gte: inicioMes } },
      })
      return memberships.reduce((sum, m) => sum + (precios[m.tipo] || 0), 0)
    }
    case 'ASISTENCIA_DIARIA': {
      const hoy = dayjs().format('YYYY-MM-DD')
      return prisma.checkIn.count({
        where: { fecha: { gte: new Date(hoy + 'T00:00:00'), lte: new Date(hoy + 'T23:59:59') }, tipo: 'ENTRADA' }
      })
    }
    default:
      return 0
  }
}

export async function GET() {
  try {
    const precios = await getPrecios()
    const metas = await prisma.meta.findMany({ orderBy: { createdAt: 'desc' } })

    const metasConProgreso = await Promise.all(
      metas.map(async (m) => ({
        ...m,
        actual: await calcularActual(m.tipo, precios),
        progreso: m.valorMeta > 0 ? Math.min(100, Math.round((await calcularActual(m.tipo, precios)) / m.valorMeta * 100)) : 0,
      }))
    )

    return NextResponse.json({ metas: metasConProgreso })
  } catch (error) {
    console.error('Error fetching metas:', error)
    return NextResponse.json({ error: 'Error al obtener metas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, tipo, valorMeta, descripcion } = await req.json()
    if (!nombre || !tipo || !valorMeta) {
      return NextResponse.json({ error: 'nombre, tipo y valorMeta son requeridos' }, { status: 400 })
    }
    const meta = await prisma.meta.create({
      data: { nombre, tipo, valorMeta: parseInt(valorMeta), descripcion }
    })
    return NextResponse.json(meta, { status: 201 })
  } catch (error) {
    console.error('Error creating meta:', error)
    return NextResponse.json({ error: 'Error al crear meta' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, nombre, tipo, valorMeta, descripcion, activa } = await req.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const data: any = {}
    if (nombre !== undefined) data.nombre = nombre
    if (tipo !== undefined) data.tipo = tipo
    if (valorMeta !== undefined) data.valorMeta = parseInt(valorMeta)
    if (descripcion !== undefined) data.descripcion = descripcion
    if (activa !== undefined) data.activa = activa

    const meta = await prisma.meta.update({ where: { id: parseInt(id) }, data })
    return NextResponse.json(meta)
  } catch (error) {
    console.error('Error updating meta:', error)
    return NextResponse.json({ error: 'Error al actualizar meta' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    await prisma.meta.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Meta eliminada' })
  } catch (error) {
    console.error('Error deleting meta:', error)
    return NextResponse.json({ error: 'Error al eliminar meta' }, { status: 500 })
  }
}
