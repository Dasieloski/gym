"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

interface Log {
  id: number
  accion: string
  descripcion: string
  fecha: string
  fechaISO: string
  usuario: {
    id: number
    nombre: string
    rol: string
  }
}

interface LogsData {
  logs: Log[]
  total: number
  page: number
  totalPages: number
  actions: string[]
  users: { id: number; nombre: string }[]
}

const actionColors: Record<string, string> = {
  'pago': 'text-green-400',
  'membresia': 'text-blue-400',
  'reserva': 'text-purple-400',
  'eliminacion': 'text-red-400',
  'cliente': 'text-cyan-400',
  'alerta': 'text-yellow-400',
}

function getActionColor(accion: string): string {
  const lower = accion.toLowerCase()
  for (const [key, value] of Object.entries(actionColors)) {
    if (lower.includes(key)) return value
  }
  return 'text-slate-400'
}

export default function LogsTab() {
  const [data, setData] = useState<LogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [page, limit, search, filterAction, filterUser, dateFrom, dateTo])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(filterAction && { action: filterAction }),
        ...(filterUser && { userId: filterUser }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })

      const response = await fetch(`/api/admin/logs?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setFilterAction('')
    setFilterUser('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = filterAction || filterUser || dateFrom || dateTo

  return (
    <div className="min-h-screen">
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Auditoría</p>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
            Registro <span className="text-outline">Completo</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Historial detallado de todas las acciones del sistema.
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por acción, descripción o usuario..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border transition-colors ${
            hasActiveFilters
              ? 'border-[#02F5D4] text-[#02F5D4]'
              : 'border-white/20 text-slate-400 hover:border-white/40'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
        <select
          value={limit}
          onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1) }}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-4 py-3 text-white focus:outline-none transition-colors"
        >
          <option value={10} className="bg-[#050505]">10 por página</option>
          <option value={20} className="bg-[#050505]">20 por página</option>
          <option value={50} className="bg-[#050505]">50 por página</option>
        </select>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border border-white/10 bg-white/[0.02]">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Tipo de acción</label>
                <select
                  value={filterAction}
                  onChange={(e) => { setFilterAction(e.target.value); setPage(1) }}
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                >
                  <option value="">Todas</option>
                  {data?.actions.map(action => (
                    <option key={action} value={action} className="bg-[#050505]">{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Usuario</label>
                <select
                  value={filterUser}
                  onChange={(e) => { setFilterUser(e.target.value); setPage(1) }}
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                >
                  <option value="">Todos</option>
                  {data?.users.map(user => (
                    <option key={user.id} value={user.id} className="bg-[#050505]">{user.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 text-sm text-[#02F5D4] hover:text-white transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-2 border-[#02F5D4]/20 border-t-[#02F5D4] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {data?.logs.map((log, index) => {
                const actionColor = getActionColor(log.accion)
                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="group relative"
                  >
                    <div className="flex items-center gap-4 p-6 border-l-2 border-white/10 hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                      <div className={`w-2 h-2 rounded-full ${actionColor.replace('text-', 'bg-')} flex-shrink-0`} />
                      
                      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 md:col-span-3">
                          <p className={`font-bold text-lg truncate ${actionColor}`}>{log.accion}</p>
                          <p className="text-slate-600 text-xs font-mono mt-1">#{log.id}</p>
                        </div>
                        
                        <div className="col-span-12 md:col-span-5">
                          <p className="text-slate-300 text-sm">{log.descripcion}</p>
                        </div>
                        
                        <div className="col-span-6 md:col-span-2">
                          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Usuario</p>
                          <p className="text-slate-300 text-sm">{log.usuario.nombre}</p>
                        </div>
                        
                        <div className="col-span-6 md:col-span-2 text-right">
                          <span className="text-slate-500 text-xs font-mono">{log.fecha}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {data?.logs.length === 0 && (
            <div className="py-24 text-center border border-dashed border-white/10">
              <p className="text-slate-500">No se encontraron registros</p>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-8">
              <span className="text-slate-400 text-sm">
                Página {data.page} de {data.totalPages} — {data.total} registros
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, data.totalPages - 4))
                  const pageNum = start + i
                  if (pageNum > data.totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-[#02F5D4] text-black'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page === data.totalPages}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
