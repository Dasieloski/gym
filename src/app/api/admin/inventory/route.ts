import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const equipos = await prisma.equipo.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(equipos)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Error al obtener el inventario' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, categoria, marca, modelo, cantidad, estado, fechaCompra, ultimoMantenimiento, proximoMantenimiento, notas } = body

    if (!nombre || !categoria) {
      return NextResponse.json({ error: 'Nombre y categoría son requeridos' }, { status: 400 })
    }

    const equipo = await prisma.equipo.create({
      data: {
        nombre,
        categoria,
        marca: marca || null,
        modelo: modelo || null,
        cantidad: cantidad || 1,
        estado: estado || 'OPERATIVO',
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        ultimoMantenimiento: ultimoMantenimiento ? new Date(ultimoMantenimiento) : null,
        proximoMantenimiento: proximoMantenimiento ? new Date(proximoMantenimiento) : null,
        notas: notas || null
      }
    })

    return NextResponse.json(equipo, { status: 201 })
  } catch (error) {
    console.error('Error creating equipment:', error)
    return NextResponse.json({ error: 'Error al crear el equipo' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const updateData: any = { ...data }
    if (data.fechaCompra) updateData.fechaCompra = new Date(data.fechaCompra)
    if (data.ultimoMantenimiento) updateData.ultimoMantenimiento = new Date(data.ultimoMantenimiento)
    if (data.proximoMantenimiento) updateData.proximoMantenimiento = new Date(data.proximoMantenimiento)

    const equipo = await prisma.equipo.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return NextResponse.json(equipo)
  } catch (error) {
    console.error('Error updating equipment:', error)
    return NextResponse.json({ error: 'Error al actualizar el equipo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    await prisma.equipo.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Equipo eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting equipment:', error)
    return NextResponse.json({ error: 'Error al eliminar el equipo' }, { status: 500 })
  }
}
