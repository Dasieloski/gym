import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

async function getPrecios() {
  const configs = await prisma.configuracion.findMany({
    where: { clave: { in: ['PRECIO_MENSUAL', 'PRECIO_TRIMESTRAL', 'PRECIO_ANUAL'] } }
  })
  const map: Record<string, number> = { MENSUAL: 2000, TRIMESTRAL: 10000, ANUAL: 20000 }
  configs.forEach(c => {
    const tipo = c.clave.replace('PRECIO_', '')
    if (c.valor) map[tipo] = parseInt(c.valor) || map[tipo]
  })
  return map
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'general'

    const PRECIOS = await getPrecios()

    if (type === 'clients') {
      const clients = await prisma.usuario.findMany({
        where: { rol: 'CLIENTE' },
        select: {
          id: true,
          nombre: true,
          carnetIdentidad: true,
          telefono: true,
          createdAt: true,
          entrenadorAsignado: {
            select: { nombre: true }
          },
          membresiaActual: {
            select: {
              tipo: true,
              fechaInicio: true,
              fechaFin: true,
              estadoPago: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const formattedClients = clients.map(c => ({
        id: c.id,
        nombre: c.nombre,
        carnet: c.carnetIdentidad,
        telefono: c.telefono,
        entrenador: c.entrenadorAsignado?.nombre || 'Sin asignar',
        membresia: c.membresiaActual?.tipo || 'Sin membresía',
        estado: c.membresiaActual?.estadoPago || 'N/A',
        fechaFin: c.membresiaActual?.fechaFin ? dayjs(c.membresiaActual.fechaFin).format('DD/MM/YYYY') : 'N/A',
        fechaRegistro: dayjs(c.createdAt).format('DD/MM/YYYY')
      }))

      return NextResponse.json({ data: formattedClients, total: clients.length })
    }

    if (type === 'memberships') {
      const memberships = await prisma.membresia.findMany({
        include: {
          cliente: {
            select: { nombre: true, carnetIdentidad: true, telefono: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const formattedMemberships = memberships.map(m => ({
        id: m.id,
        cliente: m.cliente.nombre,
        carnet: m.cliente.carnetIdentidad,
        telefono: m.cliente.telefono,
        tipo: m.tipo,
        estadoPago: m.estadoPago,
        fechaInicio: dayjs(m.fechaInicio).format('DD/MM/YYYY'),
        fechaFin: dayjs(m.fechaFin).format('DD/MM/YYYY'),
        creado: dayjs(m.createdAt).format('DD/MM/YYYY')
      }))

      return NextResponse.json({ data: formattedMemberships, total: memberships.length })
    }

    if (type === 'revenue') {
      const memberships = await prisma.membresia.findMany({
        where: { estadoPago: 'PAGADO' },
        include: {
          cliente: { select: { nombre: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      const revenueByMonth: Record<string, number> = {}
      const revenueByType = { MENSUAL: 0, TRIMESTRAL: 0, ANUAL: 0 }
      
      memberships.forEach(m => {
        const month = dayjs(m.createdAt).format('YYYY-MM')
        const amount = PRECIOS[m.tipo] || 0
        revenueByMonth[month] = (revenueByMonth[month] || 0) + amount
        revenueByType[m.tipo] = (revenueByType[m.tipo] || 0) + amount
      })

      const monthlyRevenue = Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({
          month: dayjs(month + '-01').format('MMMM YYYY'),
          amount
        }))

      const totalRevenue = Object.values(revenueByType).reduce((a, b) => a + b, 0)

      return NextResponse.json({
        monthlyRevenue,
        revenueByType,
        totalRevenue,
        totalMemberships: memberships.length
      })
    }

    if (type === 'financial') {
      const memberships = await prisma.membresia.findMany({
        where: { estadoPago: 'PAGADO' },
        select: { tipo: true, createdAt: true }
      })

      const gastos = await prisma.gasto.findMany({
        select: { monto: true, moneda: true, categoria: true, fecha: true }
      })

      const revenueByMonth: Record<string, number> = {}
      const gastosByMonth: Record<string, number> = {}

      memberships.forEach(m => {
        const month = dayjs(m.createdAt).format('YYYY-MM')
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (PRECIOS[m.tipo] || 0)
      })

      gastos.forEach(g => {
        const month = dayjs(g.fecha).format('YYYY-MM')
        gastosByMonth[month] = (gastosByMonth[month] || 0) + Number(g.monto)
      })

      const allMonths = new Set([...Object.keys(revenueByMonth), ...Object.keys(gastosByMonth)])
      const monthly = Array.from(allMonths).sort().map(month => ({
        month: dayjs(month + '-01').format('MMMM YYYY'),
        ingresos: revenueByMonth[month] || 0,
        gastos: gastosByMonth[month] || 0,
      }))

      const totalIngresos = memberships.reduce((sum, m) => sum + (PRECIOS[m.tipo] || 0), 0)
      const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0)

      const gastosByCategoria: Record<string, number> = {}
      gastos.forEach(g => {
        gastosByCategoria[g.categoria] = (gastosByCategoria[g.categoria] || 0) + Number(g.monto)
      })

      const revenueByType = { MENSUAL: 0, TRIMESTRAL: 0, ANUAL: 0 }
      memberships.forEach(m => { revenueByType[m.tipo] += PRECIOS[m.tipo] || 0 })

      return NextResponse.json({
        monthly,
        totalIngresos,
        totalGastos,
        balance: totalIngresos - totalGastos,
        revenueByType,
        gastosByCategoria,
        totalMemberships: memberships.length,
        totalGastosCount: gastos.length,
      })
    }

    if (type === 'bookings') {
      const bookings = await prisma.reserva.findMany({
        include: {
          cliente: { select: { nombre: true, carnetIdentidad: true } },
          entrenador: {
            include: { usuario: { select: { nombre: true } } }
          }
        },
        orderBy: { fecha: 'desc' }
      })

      const formattedBookings = bookings.map(b => ({
        id: b.id,
        cliente: b.cliente.nombre,
        carnet: b.cliente.carnetIdentidad,
        entrenador: b.entrenador?.usuario.nombre || 'Sin asignar',
        estado: b.estado,
        fecha: dayjs(b.fecha).format('DD/MM/YYYY HH:mm'),
        creado: dayjs(b.createdAt).format('DD/MM/YYYY')
      }))

      return NextResponse.json({ data: formattedBookings, total: bookings.length })
    }

    if (type === 'general') {
      const totalClients = await prisma.usuario.count({ where: { rol: 'CLIENTE' } })
      const totalTrainers = await prisma.usuario.count({ where: { rol: 'ENTRENADOR' } })
      const totalWaiting = await prisma.usuario.count({ where: { rol: 'CLIENTEESPERA' } })
      const activeMemberships = await prisma.membresia.count({ where: { estadoPago: 'PAGADO' } })
      const totalBookings = await prisma.reserva.count()
      const activeBookings = await prisma.reserva.count({ where: { estado: 'ACTIVA' } })
      const totalGastosCount = await prisma.gasto.count()
      
      const gastosTotal = await prisma.gasto.aggregate({ _sum: { monto: true } })
      
      const memberships = await prisma.membresia.findMany({
        where: { estadoPago: 'PAGADO' }
      })
      
      const totalRevenue = memberships.reduce((sum, m) => sum + (PRECIOS[m.tipo] || 0), 0)

      return NextResponse.json({
        totalClients,
        totalTrainers,
        totalWaiting,
        activeMemberships,
        totalBookings,
        activeBookings,
        totalRevenue,
        totalGastos: Number(gastosTotal._sum.monto) || 0,
        totalGastosCount,
        balance: totalRevenue - (Number(gastosTotal._sum.monto) || 0),
      })
    }

    return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Error al generar el reporte' }, { status: 500 })
  }
}
