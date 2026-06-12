"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { toast } from 'react-toastify'

interface Equipo {
  id: number
  nombre: string
  categoria: string
  marca?: string
  modelo?: string
  cantidad: number
  estado: 'OPERATIVO' | 'MANTENIMIENTO' | 'DANADO' | 'RETIRADO'
  fechaCompra?: string
  ultimoMantenimiento?: string
  proximoMantenimiento?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

const categorias = ['Cardio', 'Pesas', 'Funcional', 'Accesorios', 'Recuperación', 'Otro']
const estados = [
  { value: 'OPERATIVO', label: 'Operativo', color: 'text-green-400', bg: 'bg-green-400' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', color: 'text-yellow-400', bg: 'bg-yellow-400' },
  { value: 'DANADO', label: 'Dañado', color: 'text-red-400', bg: 'bg-red-400' },
  { value: 'RETIRADO', label: 'Retirado', color: 'text-slate-500', bg: 'bg-slate-500' },
]

export default function InventoryTab() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Cardio',
    marca: '',
    modelo: '',
    cantidad: 1,
    estado: 'OPERATIVO',
    fechaCompra: '',
    ultimoMantenimiento: '',
    proximoMantenimiento: '',
    notas: ''
  })

  useEffect(() => {
    fetchEquipos()
  }, [])

  const fetchEquipos = async () => {
    try {
      const response = await fetch('/api/admin/inventory')
      const data = await response.json()
      setEquipos(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/admin/inventory'
      const method = editingEquipo ? 'PUT' : 'POST'
      const body = editingEquipo ? { ...formData, id: editingEquipo.id } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error('Error al guardar')

      toast.success(editingEquipo ? 'Equipo actualizado' : 'Equipo creado')
      setShowForm(false)
      setEditingEquipo(null)
      resetForm()
      fetchEquipos()
    } catch (error) {
      toast.error('Error al guardar el equipo')
    }
  }

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo)
    setFormData({
      nombre: equipo.nombre,
      categoria: equipo.categoria,
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      cantidad: equipo.cantidad,
      estado: equipo.estado,
      fechaCompra: equipo.fechaCompra ? equipo.fechaCompra.split('T')[0] : '',
      ultimoMantenimiento: equipo.ultimoMantenimiento ? equipo.ultimoMantenimiento.split('T')[0] : '',
      proximoMantenimiento: equipo.proximoMantenimiento ? equipo.proximoMantenimiento.split('T')[0] : '',
      notas: equipo.notas || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return

    try {
      const response = await fetch(`/api/admin/inventory?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('Equipo eliminado')
      fetchEquipos()
    } catch (error) {
      toast.error('Error al eliminar el equipo')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: 'Cardio',
      marca: '',
      modelo: '',
      cantidad: 1,
      estado: 'OPERATIVO',
      fechaCompra: '',
      ultimoMantenimiento: '',
      proximoMantenimiento: '',
      notas: ''
    })
  }

  const filteredEquipos = equipos.filter(e => {
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase()) ||
                       e.marca?.toLowerCase().includes(search.toLowerCase()) ||
                       e.modelo?.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = !filterCategoria || e.categoria === filterCategoria
    const matchEstado = !filterEstado || e.estado === filterEstado
    return matchSearch && matchCategoria && matchEstado
  })

  const stats = {
    total: equipos.length,
    operativo: equipos.filter(e => e.estado === 'OPERATIVO').length,
    mantenimiento: equipos.filter(e => e.estado === 'MANTENIMIENTO').length,
    danado: equipos.filter(e => e.estado === 'DANADO').length,
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-[#02F5D4]/20 border-t-[#02F5D4] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#02F5D4] text-xs uppercase tracking-[0.3em] mb-3">Inventario</p>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
              Equipamiento <span className="text-outline">Técnico</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Control y mantenimiento del arsenal del gimnasio.
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-end">
          <button
            onClick={() => { setShowForm(true); setEditingEquipo(null); resetForm() }}
            className="group relative overflow-hidden bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white px-8 py-4 font-bold uppercase tracking-wider transition-all duration-300 rounded-xl"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Equipo
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-12">
        <StatBlock label="Total" value={stats.total} />
        <StatBlock label="Operativos" value={stats.operativo} color="text-green-400" />
        <StatBlock label="Mantenimiento" value={stats.mantenimiento} color="text-yellow-400" />
        <StatBlock label="Dañados" value={stats.danado} color="text-red-400" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-0 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors"
        />
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-0 py-3 text-white focus:outline-none transition-colors"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="bg-transparent border-b border-white/20 focus:border-[#02F5D4] px-0 py-3 text-white focus:outline-none transition-colors"
        >
          <option value="">Todos los estados</option>
          {estados.map(e => <option key={e.value} value={e.value} className="bg-[#050505]">{e.label}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <AnimatePresence>
          {filteredEquipos.map((equipo, index) => {
            const estadoInfo = estados.find(e => e.value === equipo.estado)
            return (
              <motion.div
                key={equipo.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="group relative"
              >
                <div className="flex items-center gap-4 p-6 border-l-2 border-white/10 hover:border-[#02F5D4] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className={`w-2 h-2 rounded-full ${estadoInfo?.bg} flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-4">
                      <p className="text-white font-bold text-lg truncate">{equipo.nombre}</p>
                      <p className="text-slate-500 text-xs font-mono mt-1">{equipo.categoria}</p>
                    </div>
                    
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Marca</p>
                      <p className="text-slate-300 text-sm">{equipo.marca || '—'}</p>
                    </div>
                    
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Cantidad</p>
                      <p className="text-white font-mono text-lg">{equipo.cantidad}</p>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2">
                      <span className={`text-xs font-mono uppercase tracking-wider ${estadoInfo?.color}`}>
                        {estadoInfo?.label}
                      </span>
                    </div>
                    
                    <div className="col-span-12 md:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(equipo)}
                        className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-white transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(equipo.id)}
                        className="px-3 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredEquipos.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/10">
          <p className="text-slate-500">No se encontraron equipos</p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-full max-w- rounded-2xl shadow-2xl shadow-black/503xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-[#02F5D4] text-xs uppercase tracking-[0.2em] mb-1">
                    {editingEquipo ? 'Editar' : 'Nuevo'}
                  </p>
                  <h3 className="text-white font-bold text-2xl">
                    {editingEquipo ? 'Modificar Equipo' : 'Registrar Equipo'}
                  </h3>
                </div>
                <button
                  onClick={() => { setShowForm(false); setEditingEquipo(null); resetForm() }}
                  className="p-2 hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Nombre *">
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Categoría *">
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    >
                      {categorias.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Marca">
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Modelo">
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Cantidad">
                    <input
                      type="number"
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Estado">
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    >
                      {estados.map(e => <option key={e.value} value={e.value} className="bg-[#050505]">{e.label}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Fecha de Compra">
                    <input
                      type="date"
                      value={formData.fechaCompra}
                      onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Último Mantenimiento">
                    <input
                      type="date"
                      value={formData.ultimoMantenimiento}
                      onChange={(e) => setFormData({ ...formData, ultimoMantenimiento: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Próximo Mantenimiento">
                    <input
                      type="date"
                      value={formData.proximoMantenimiento}
                      onChange={(e) => setFormData({ ...formData, proximoMantenimiento: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors"
                    />
                  </FormField>
                </div>
                <FormField label="Notas">
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#02F5D4] py-2 text-white focus:outline-none transition-colors resize-none"
                  />
                </FormField>

                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingEquipo(null); resetForm() }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2272FF] to-[#02F5D4] hover:from-[#02F5D4] hover:to-[#2272FF] text-white font-bold transition-all duration-300 rounded-xl"
                  >
                    {editingEquipo ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBlock({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="border-l border-white/20 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors duration-300">
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-5xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">{label}</label>
      {children}
    </div>
  )
}
