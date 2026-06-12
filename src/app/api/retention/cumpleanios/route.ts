import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || String(dayjs().month() + 1)

    const upcoming = await prisma.usuario.findMany({
      where: {
        rol: 'CLIENTE',
        fechaNacimiento: { not: null }
      },
      select: {
        id: true,
        nombre: true,
        foto: true,
        fechaNacimiento: true,
        telefono: true,
        recompensaCumpleanios: { select: { id: true, canjeada: true, anio: true, fechaCanje: true } }
      }
    })

    const currentYear = dayjs().year()
    const filtered = upcoming
      .filter(u => {
        const birthMonth = dayjs(u.fechaNacimiento).month() + 1
        return birthMonth === parseInt(month) || birthMonth === parseInt(month) % 12 + 1
      })
      .map(u => {
        const birthDate = dayjs(u.fechaNacimiento!)
        const birthThisYear = birthDate.year(currentYear)
        const daysUntil = dayjs().diff(birthThisYear, 'day') <= 0
          ? birthThisYear.diff(dayjs(), 'day')
          : birthThisYear.add(1, 'year').diff(dayjs(), 'day')

        const reward = u.recompensaCumpleanios?.anio === currentYear ? u.recompensaCumpleanios : null

        return {
          id: u.id,
          nombre: u.nombre,
          foto: u.foto,
          telefono: u.telefono,
          fechaNacimiento: u.fechaNacimiento,
          diasRestantes: daysUntil,
          recompensaCanjeada: reward?.canjeada || false,
          recompensaId: reward?.id || null
        }
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)

    return NextResponse.json({ cumpleanios: filtered, total: filtered.length })
  } catch (error) {
    console.error('Error fetching cumpleanios:', error)
    return NextResponse.json({ error: 'Error al obtener cumpleaños' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { usuarioId } = await req.json()

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId requerido' }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) },
      select: { fechaNacimiento: true }
    })

    if (!user?.fechaNacimiento) {
      return NextResponse.json({ error: 'Usuario sin fecha de nacimiento' }, { status: 400 })
    }

    const currentYear = dayjs().year()
    const existing = await prisma.recompensaCumpleanios.findUnique({
      where: { usuarioId: parseInt(usuarioId) }
    })

    if (existing && existing.anio === currentYear) {
      if (existing.canjeada) {
        return NextResponse.json({ error: 'Recompensa ya canjeada este año' }, { status: 400 })
      }
      const updated = await prisma.recompensaCumpleanios.update({
        where: { id: existing.id },
        data: { canjeada: true, fechaCanje: new Date() }
      })
      return NextResponse.json(updated)
    }

    const reward = await prisma.recompensaCumpleanios.create({
      data: {
        usuarioId: parseInt(usuarioId),
        anio: currentYear,
        canjeada: true,
        fechaCanje: new Date()
      }
    })

    await prisma.punto.create({
      data: {
        usuarioId: parseInt(usuarioId),
        puntos: 200,
        concepto: `Recompensa de cumpleaños ${currentYear}`,
        referencia: 'BIRTHDAY_REWARD'
      }
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    console.error('Error processing cumpleanios:', error)
    return NextResponse.json({ error: 'Error al procesar cumpleaños' }, { status: 500 })
  }
}
