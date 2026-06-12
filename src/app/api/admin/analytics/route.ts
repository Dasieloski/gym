import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    const type = searchParams.get('type') || 'executive'
    const PRECIOS = await getPrecios()

    if (type === 'executive') {
      const now = dayjs()
      const startOfMonth = now.startOf('month').toDate()
      const endOfMonth = now.endOf('month').toDate()
      const sixMonthsAgo = now.subtract(6, 'month').startOf('month').toDate()

      const [totalClients, activeMemberships, totalCheckinsThisMonth, newClientsThisMonth, totalTrainers] = await Promise.all([
        prisma.usuario.count({ where: { rol: 'CLIENTE' } }),
        prisma.membresia.count({ where: { estadoPago: 'PAGADO', fechaFin: { gte: now.toDate() } } }),
        prisma.checkIn.count({ where: { fecha: { gte: startOfMonth, lte: endOfMonth } } }),
        prisma.usuario.count({ where: { rol: 'CLIENTE', createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
        prisma.usuario.count({ where: { rol: 'ENTRENADOR' } }),
      ])

      const revenueData = await prisma.membresia.findMany({
        where: { estadoPago: 'PAGADO', createdAt: { gte: sixMonthsAgo } },
        select: { tipo: true, createdAt: true, clienteId: true }
      })

      const monthlyRevenue: Record<string, number> = {}
      revenueData.forEach(r => {
        const month = dayjs(r.createdAt).format('YYYY-MM')
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (PRECIOS[r.tipo] || 0)
      })

      const sortedMonths = Object.keys(monthlyRevenue).sort()
      const revenueForecast = sortedMonths.map(m => ({
        month: dayjs(m + '-01').format('MMM YYYY'),
        actual: monthlyRevenue[m] || 0,
        forecast: null as number | null
      }))

      if (sortedMonths.length >= 3) {
        const last3 = sortedMonths.slice(-3).map(m => monthlyRevenue[m])
        const avg = last3.reduce((a, b) => a + b, 0) / last3.length
        const nextMonth = dayjs(sortedMonths[sortedMonths.length - 1] + '-01').add(1, 'month').format('MMM YYYY')
        revenueForecast.push({ month: nextMonth, actual: 0, forecast: Math.round(avg) })
      }

      const expiringSoon = await prisma.usuario.findMany({
        where: {
          rol: 'CLIENTE',
          membresiaActual: {
            fechaFin: {
              gte: now.toDate(),
              lte: now.add(7, 'day').toDate()
            },
            estadoPago: 'PAGADO'
          }
        },
        select: {
          id: true,
          nombre: true,
          membresiaActual: {
            select: { tipo: true, fechaFin: true }
          }
        },
        orderBy: { membresiaActual: { fechaFin: 'asc' } }
      })

      const churnRisk = expiringSoon.map(c => ({
        id: c.id,
        nombre: c.nombre,
        membresia: c.membresiaActual?.tipo || 'N/A',
        expira: c.membresiaActual?.fechaFin ? dayjs(c.membresiaActual.fechaFin).format('DD/MM/YYYY') : 'N/A',
        diasRestantes: c.membresiaActual?.fechaFin ? dayjs(c.membresiaActual.fechaFin).diff(now, 'day') : 0
      }))

      const clientsWithRevenue = await prisma.usuario.findMany({
        where: { rol: 'CLIENTE' },
        select: {
          id: true,
          nombre: true,
          createdAt: true,
          pagos: { select: { monto: true } }
        }
      })

      let totalLTV = 0
      const clientCount = clientsWithRevenue.length
      clientsWithRevenue.forEach(c => {
        c.pagos.forEach(p => { totalLTV += Number(p.monto) })
      })
      const avgLTV = clientCount > 0 ? Math.round(totalLTV / clientCount) : 0

      const monthlyNewClients: Record<string, number> = {}
      clientsWithRevenue.forEach(c => {
        const month = dayjs(c.createdAt).format('YYYY-MM')
        monthlyNewClients[month] = (monthlyNewClients[month] || 0) + 1
      })
      const acqMonths = Object.values(monthlyNewClients)
      const avgCAC = acqMonths.length > 0 ? Math.round(acqMonths.reduce((a, b) => a + b, 0) / acqMonths.length) : 0

      const activeMembersCount = await prisma.membresia.count({
        where: { estadoPago: 'PAGADO', fechaFin: { gte: now.toDate() } }
      })
      const totalClientCount = await prisma.usuario.count({ where: { rol: 'CLIENTE' } })
      const retentionRate = totalClientCount > 0 ? Math.round((activeMembersCount / totalClientCount) * 100) : 0

      const trainerPerformance = await prisma.usuario.findMany({
        where: { rol: 'ENTRENADOR' },
        select: {
          id: true,
          nombre: true,
          foto: true,
          clientesAsignados: {
            select: {
              id: true,
              membresiaActual: { select: { tipo: true, estadoPago: true } }
            }
          }
        }
      })

      const trainerMetrics = trainerPerformance.map(t => {
        const activeClients = t.clientesAsignados.filter(c => c.membresiaActual?.estadoPago === 'PAGADO')
        const revenue = activeClients.reduce((sum, c) => {
          return sum + (c.membresiaActual ? (PRECIOS[c.membresiaActual.tipo] || 0) : 0)
        }, 0)
        return {
          id: t.id,
          nombre: t.nombre,
          foto: t.foto,
          totalClientes: t.clientesAsignados.length,
          clientesActivos: activeClients.length,
          ingresosEstimados: revenue
        }
      })

      return NextResponse.json({
        totalClients,
        activeMemberships,
        totalCheckinsThisMonth,
        newClientsThisMonth,
        totalTrainers,
        revenueForecast,
        churnRisk,
        avgLTV,
        avgCAC,
        retentionRate,
        trainerMetrics
      })
    }

    if (type === 'cohorts') {
      const clients = await prisma.usuario.findMany({
        where: { rol: 'CLIENTE' },
        select: {
          id: true,
          createdAt: true,
          membresias: {
            select: { fechaInicio: true, fechaFin: true, estadoPago: true },
            orderBy: { fechaInicio: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      const cohorts: Record<string, { total: number; retained: Record<string, number> }> = {}

      clients.forEach(c => {
        const cohortMonth = dayjs(c.createdAt).format('YYYY-MM')
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = { total: 0, retained: {} }
        }
        cohorts[cohortMonth].total++

        c.membresias.forEach(m => {
          if (m.estadoPago === 'PAGADO') {
            const monthsDiff = dayjs(m.fechaFin).diff(dayjs(m.fechaInicio), 'month')
            for (let i = 1; i <= monthsDiff; i++) {
              const period = `${i}m`
              cohorts[cohortMonth].retained[period] = (cohorts[cohortMonth].retained[period] || 0) + 1
            }
          }
        })
      })

      const cohortData = Object.entries(cohorts).map(([month, data]) => ({
        cohort: dayjs(month + '-01').format('MMM YYYY'),
        total: data.total,
        retention: {
          '1m': data.total > 0 ? Math.round((data.retained['1m'] || 0) / data.total * 100) : 0,
          '3m': data.total > 0 ? Math.round((data.retained['3m'] || 0) / data.total * 100) : 0,
          '6m': data.total > 0 ? Math.round((data.retained['6m'] || 0) / data.total * 100) : 0,
          '12m': data.total > 0 ? Math.round((data.retained['12m'] || 0) / data.total * 100) : 0,
        }
      }))

      return NextResponse.json({ cohorts: cohortData })
    }

    return NextResponse.json({ error: 'Tipo de analítica no válido' }, { status: 400 })
  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json({ error: 'Error al generar analíticas' }, { status: 500 })
  }
}
