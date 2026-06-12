"use client"
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

const RosenBarChart = dynamic(() => import('@/components/charts/RosenBarChart'), { ssr: false })

const reportTypes = [
  { id: 'general', label: 'Resumen', num: '01', desc: 'KPIs generales' },
  { id: 'financial', label: 'Financiero', num: '02', desc: 'Ingresos vs Gastos con gráfica' },
  { id: 'clients', label: 'Clientes', num: '03', desc: 'Base de datos completa' },
  { id: 'memberships', label: 'Membresías', num: '04', desc: 'Estado y vencimientos' },
  { id: 'revenue', label: 'Ingresos', num: '05', desc: 'Análisis financiero' },
  { id: 'bookings', label: 'Reservas', num: '06', desc: 'Historial de sesiones' },
]

export default function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState('general')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const fetchReport = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports?type=${type}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    if (!reportData) return
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()
    const date = new Date().toLocaleDateString('es-ES')
    
    doc.setFontSize(24)
    doc.text('GIMNASIO', 14, 20)
    doc.setFontSize(10)
    doc.text(`Reporte ${reportTypes.find(r => r.id === selectedReport)?.label} — ${date}`, 14, 28)

    if (selectedReport === 'general') {
      const data = [
        ['Clientes', reportData.totalClients?.toString() || '0'],
        ['Entrenadores', reportData.totalTrainers?.toString() || '0'],
        ['En Espera', reportData.totalWaiting?.toString() || '0'],
        ['Membresías', reportData.activeMemberships?.toString() || '0'],
        ['Reservas', reportData.totalBookings?.toString() || '0'],
        ['Ingresos', `${reportData.totalRevenue?.toLocaleString() || '0'} CUP`],
        ['Gastos', `${reportData.totalGastos?.toLocaleString() || '0'} CUP`],
        ['Balance', `${reportData.balance?.toLocaleString() || '0'} CUP`],
      ]
      autoTable(doc, { startY: 40, head: [['Métrica', 'Valor']], body: data, theme: 'plain' })
    } else if (selectedReport === 'clients' && reportData.data) {
      const data = reportData.data.map((c: any) => [c.nombre, c.carnet, c.entrenador, c.membresia, c.estado])
      autoTable(doc, { startY: 40, head: [['Nombre', 'Carnet', 'Entrenador', 'Membresía', 'Estado']], body: data, theme: 'plain', styles: { fontSize: 8 } })
    } else if (selectedReport === 'memberships' && reportData.data) {
      const data = reportData.data.map((m: any) => [m.cliente, m.tipo, m.estadoPago, m.fechaFin])
      autoTable(doc, { startY: 40, head: [['Cliente', 'Tipo', 'Estado', 'Vence']], body: data, theme: 'plain', styles: { fontSize: 8 } })
    } else if (selectedReport === 'financial') {
      doc.text(`Ingresos: ${reportData.totalIngresos?.toLocaleString() || '0'} CUP`, 14, 40)
      doc.text(`Gastos: ${reportData.totalGastos?.toLocaleString() || '0'} CUP`, 14, 48)
      doc.text(`Balance: ${reportData.balance?.toLocaleString() || '0'} CUP`, 14, 56)
      if (reportData.revenueByType) {
        const typeData = Object.entries(reportData.revenueByType).map(([type, amount]) => [type, `${(amount as number).toLocaleString()} CUP`])
        autoTable(doc, { startY: 65, head: [['Tipo Ingreso', 'Monto']], body: typeData, theme: 'plain' })
      }
      if (reportData.gastosByCategoria) {
        const gastosData = Object.entries(reportData.gastosByCategoria).map(([cat, amount]) => [cat, `${(amount as number).toLocaleString()} CUP`])
        autoTable(doc, { startY: reportData.revenueByType ? 95 : 65, head: [['Categoría Gasto', 'Monto']], body: gastosData, theme: 'plain' })
      }
    } else if (selectedReport === 'revenue') {
      doc.text(`Total: ${reportData.totalRevenue?.toLocaleString() || '0'} CUP`, 14, 40)
      if (reportData.revenueByType) {
        const typeData = Object.entries(reportData.revenueByType).map(([type, amount]) => [type, `${(amount as number).toLocaleString()} CUP`])
        autoTable(doc, { startY: 50, head: [['Tipo', 'Ingresos']], body: typeData, theme: 'plain' })
      }
    } else if (selectedReport === 'bookings' && reportData.data) {
      const data = reportData.data.map((b: any) => [b.cliente, b.entrenador, b.estado, b.fecha])
      autoTable(doc, { startY: 40, head: [['Cliente', 'Entrenador', 'Estado', 'Fecha']], body: data, theme: 'plain', styles: { fontSize: 8 } })
    }

    doc.save(`gimnasio-${selectedReport}-${date.replace(/\//g, '-')}.pdf`)
  }

  const exportToExcel = async () => {
    if (!reportData) return
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    let ws: any

    if (selectedReport === 'general') {
      ws = XLSX.utils.aoa_to_sheet([
        ['Métrica', 'Valor'],
        ['Clientes', reportData.totalClients],
        ['Entrenadores', reportData.totalTrainers],
        ['En Espera', reportData.totalWaiting],
        ['Membresías', reportData.activeMemberships],
        ['Ingresos (CUP)', reportData.totalRevenue],
        ['Gastos (CUP)', reportData.totalGastos],
        ['Balance (CUP)', reportData.balance],
      ])
    } else if (selectedReport === 'clients' && reportData.data) {
      ws = XLSX.utils.json_to_sheet(reportData.data)
    } else if (selectedReport === 'memberships' && reportData.data) {
      ws = XLSX.utils.json_to_sheet(reportData.data)
    } else if (selectedReport === 'financial') {
      const rows = [
        ['Ingresos Totales (CUP)', reportData.totalIngresos],
        ['Gastos Totales (CUP)', reportData.totalGastos],
        ['Balance (CUP)', reportData.balance],
        [],
        ['Tipo Ingreso', 'Monto (CUP)'],
        ...Object.entries(reportData.revenueByType || {}).map(([type, amount]) => [type, amount]),
        [],
        ['Categoría Gasto', 'Monto (CUP)'],
        ...Object.entries(reportData.gastosByCategoria || {}).map(([cat, amount]) => [cat, amount]),
        [],
        ['Mes', 'Ingresos', 'Gastos'],
        ...(reportData.monthly || []).map((m: any) => [m.month, m.ingresos, m.gastos]),
      ]
      ws = XLSX.utils.aoa_to_sheet(rows)
    } else if (selectedReport === 'revenue') {
      ws = XLSX.utils.aoa_to_sheet([
        ['Ingresos Totales (CUP)', reportData.totalRevenue],
        [],
        ['Tipo', 'Ingresos (CUP)'],
        ...Object.entries(reportData.revenueByType || {}).map(([type, amount]) => [type, amount]),
      ])
    } else if (selectedReport === 'bookings' && reportData.data) {
      ws = XLSX.utils.json_to_sheet(reportData.data)
    } else {
      return
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
    XLSX.writeFile(wb, `gimnasio-${selectedReport}-${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`)
  }

  return (
    <div className="min-h-screen">
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Reportes</p>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
            Datos <span className="text-outline">Reales</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Información precisa del gimnasio, lista para exportar y analizar.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-5 space-y-2">
          {reportTypes.map((report, i) => (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => {
                setSelectedReport(report.id)
                fetchReport(report.id)
              }}
              className={`w-full text-left p-6 border-l-2 transition-all group ${
                selectedReport === report.id
                  ? 'border-[#02F5D4] bg-white/[0.02]'
                  : 'border-white/10 hover:border-white/30 hover:bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-4">
                  <span className={`text-xs font-mono ${
                    selectedReport === report.id ? 'text-[#02F5D4]' : 'text-slate-600'
                  }`}>
                    {report.num}
                  </span>
                  <span className={`text-2xl font-bold ${
                    selectedReport === report.id ? 'text-white' : 'text-slate-400'
                  }`}>
                    {report.label}
                  </span>
                </div>
                <ArrowRight className={`w-4 h-4 transition-all ${
                  selectedReport === report.id
                    ? 'text-[#02F5D4] translate-x-0 opacity-100'
                    : 'text-slate-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                }`} />
              </div>
              <p className={`text-sm mt-2 ml-8 ${
                selectedReport === report.id ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {report.desc}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-96 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 border-2 border-[#02F5D4]/20 border-t-[#02F5D4] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400 text-sm">Generando reporte...</p>
                </div>
              </motion.div>
            ) : reportData ? (
              <motion.div
                key={selectedReport}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">
                      {reportTypes.find(r => r.id === selectedReport)?.label}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportToPDF}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="px-4 py-2 bg-[#02F5D4]/10 hover:bg-[#02F5D4]/20 border border-[#02F5D4]/30 text-[#02F5D4] text-sm transition-colors"
                    >
                      Excel
                    </button>
                  </div>
                </div>

                {selectedReport === 'general' && (
                  <div className="grid grid-cols-2 gap-px bg-white/10">
                    <MetricBlock label="Clientes" value={reportData.totalClients} />
                    <MetricBlock label="Entrenadores" value={reportData.totalTrainers} />
                    <MetricBlock label="En Espera" value={reportData.totalWaiting} />
                    <MetricBlock label="Membresías" value={reportData.activeMemberships} />
                    <MetricBlock label="Reservas" value={reportData.totalBookings} />
                    <MetricBlock label="Ingresos" value={`${reportData.totalRevenue?.toLocaleString() || 0}`} unit="CUP" />
                    <MetricBlock label="Gastos" value={`${reportData.totalGastos?.toLocaleString() || 0}`} unit="CUP" />
                    <MetricBlock
                      label="Balance"
                      value={`${reportData.balance?.toLocaleString() || 0}`}
                      unit="CUP"
                      highlight={reportData.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}
                    />
                  </div>
                )}

                {selectedReport === 'financial' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-px bg-white/10">
                      <MetricBlock label="Ingresos" value={`${reportData.totalIngresos?.toLocaleString() || 0}`} unit="CUP" />
                      <MetricBlock label="Gastos" value={`${reportData.totalGastos?.toLocaleString() || 0}`} unit="CUP" />
                      <MetricBlock
                        label="Balance"
                        value={`${reportData.balance?.toLocaleString() || 0}`}
                        unit="CUP"
                        highlight={reportData.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}
                      />
                    </div>

                    {reportData.monthly && reportData.monthly.length > 0 && (
                      <div className="border border-white/10 p-6">
                        <p className="text-white font-bold text-lg mb-6">Ingresos vs Gastos por Mes</p>
                        <div className="h-[250px]">
                          <RosenBarChart
                            data={reportData.monthly.map((m: any) => ({
                              label: m.month.split(' ')[0],
                              value: m.ingresos,
                              color: "#02F5D4",
                              value2: m.gastos,
                              color2: "#FF6B6B",
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {reportData.revenueByType && (
                        <div className="border border-white/10 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <p className="text-white font-bold">Ingresos por Tipo</p>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(reportData.revenueByType).map(([tipo, amount]) => (
                              <div key={tipo} className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">{tipo}</span>
                                <span className="text-white font-mono">{(amount as number).toLocaleString()} CUP</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {reportData.gastosByCategoria && (
                        <div className="border border-white/10 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <p className="text-white font-bold">Gastos por Categoría</p>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(reportData.gastosByCategoria).map(([cat, amount]) => (
                              <div key={cat} className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">{cat}</span>
                                <span className="text-white font-mono">{(amount as number).toLocaleString()} CUP</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedReport === 'clients' && reportData.data && (
                  <div className="space-y-2">
                    {reportData.data.slice(0, 8).map((c: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-4 bg-white/[0.02] border-l-2 border-white/10 hover:border-[#02F5D4]/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{c.nombre}</p>
                          <p className="text-slate-500 text-xs mt-1">{c.carnet}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-slate-400">{c.entrenador}</span>
                          <span className={`px-2 py-1 text-xs ${
                            c.estado === 'PAGADO' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {c.estado}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {reportData.data.length > 8 && (
                      <p className="text-slate-500 text-xs text-center pt-4">
                        +{reportData.data.length - 8} registros más. Exporta para ver todos.
                      </p>
                    )}
                  </div>
                )}

                {selectedReport === 'memberships' && reportData.data && (
                  <div className="space-y-2">
                    {reportData.data.slice(0, 8).map((m: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-4 bg-white/[0.02] border-l-2 border-white/10 hover:border-[#02F5D4]/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{m.cliente}</p>
                          <p className="text-slate-500 text-xs mt-1">{m.tipo}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-slate-400">{m.fechaFin}</span>
                          <span className={`px-2 py-1 text-xs ${
                            m.estadoPago === 'PAGADO' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {m.estadoPago}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {selectedReport === 'revenue' && (
                  <div className="space-y-8">
                    <div className="text-center py-12 bg-white/[0.02] border border-white/10">
                      <p className="text-slate-400 text-sm mb-2">Ingresos Totales</p>
                      <p className="text-6xl font-black text-white tracking-tighter">
                        {reportData.totalRevenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-[#02F5D4] text-sm mt-2">CUP</p>
                    </div>
                    {reportData.revenueByType && (
                      <div className="grid grid-cols-3 gap-px bg-white/10">
                        {Object.entries(reportData.revenueByType).map(([type, amount]) => (
                          <div key={type} className="border-l border-white/20 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">{type}</p>
                            <p className="text-2xl font-bold text-white">{(amount as number).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedReport === 'bookings' && reportData.data && (
                  <div className="space-y-2">
                    {reportData.data.slice(0, 8).map((b: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-4 bg-white/[0.02] border-l-2 border-white/10 hover:border-[#02F5D4]/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{b.cliente}</p>
                          <p className="text-slate-500 text-xs mt-1">{b.entrenador}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-slate-400">{b.fecha}</span>
                          <span className={`px-2 py-1 text-xs ${
                            b.estado === 'ACTIVA' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {b.estado}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 flex items-center justify-center border border-dashed border-white/10"
              >
                <div className="text-center">
                  <p className="text-slate-500 text-sm">Selecciona un reporte para comenzar</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function MetricBlock({ label, value, unit, highlight }: { label: string; value: string | number; unit?: string; highlight?: string }) {
  return (
    <div className="border-l border-white/20 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors duration-300">
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-4xl font-black tracking-tighter ${highlight || 'text-white'}`}>{value}</p>
        {unit && <p className={`text-sm ${highlight || 'text-[#02F5D4]'}`}>{unit}</p>}
      </div>
    </div>
  )
}
