"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, Dumbbell, LogOut, DollarSign, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import Atmosphere from "@/components/landing/Atmosphere"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  navItems: NavItem[]
  activeTab: string
  onTabChange: (tab: string) => void
  onSignOut: () => void
}

export default function DashboardLayout({
  children,
  title,
  navItems,
  activeTab,
  onTabChange,
  onSignOut,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tasaUsd, setTasaUsd] = useState(0)
  const { data: session } = useSession()
  const userRol = (session?.user as { rol?: string })?.rol
  const isAdmin = userRol === 'ADMIN'
  const [editTasa, setEditTasa] = useState(false)
  const [tasaInput, setTasaInput] = useState("0")
  const [notificaciones, setNotificaciones] = useState<{ id: number; titulo: string; mensaje: string; tipo: string; leida: boolean; createdAt: string }[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/notificaciones")
      .then(r => r.ok && r.json())
      .then(data => {
        if (data) {
          setNotificaciones(data.notificaciones || [])
          setNoLeidas(data.noLeidas || 0)
        }
      })
      .catch(() => {})
  }, [])

  const marcarLeidas = async (id?: number) => {
    await fetch("/api/notificaciones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (id) {
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setNoLeidas(prev => Math.max(0, prev - 1))
    } else {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/notificaciones")
        .then(r => r.ok && r.json())
        .then(data => {
          if (data) {
            setNotificaciones(data.notificaciones || [])
            setNoLeidas(data.noLeidas || 0)
          }
        })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetch("/api/config")
      .then((r) => r.ok && r.json())
      .then((data) => {
        const t = parseInt(data?.TASA_USD) || 0
        setTasaUsd(t)
        setTasaInput(t.toString())
      })
      .catch(() => {})
  }, [isAdmin])

  const handleSaveTasa = async () => {
    const val = parseInt(tasaInput) || 0
    if (val <= 0) return
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave: "TASA_USD", valor: val.toString(), descripcion: "Tasa de cambio (1 USD = ? CUP)" }),
    })
    setTasaUsd(val)
    setEditTasa(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      {/* Shared Atmosphere background */}
      <Atmosphere
        spotlightColor="rgba(2,245,212,0.06)"
        spotlightSize="700px"
        showParticles={false}
      />

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-72 bg-white/[0.02] backdrop-blur-2xl border-r border-white/10",
          "flex flex-col transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <Dumbbell className="w-6 h-6 text-[#02F5D4] group-hover:scale-110 transition-transform" />
            <div>
              <h1 className="text-lg font-heading font-black tracking-tighter text-white leading-none">
                GIMNASIO
              </h1>
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-sans">Gimnasio</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                activeTab === item.id
                  ? "bg-gradient-to-r from-[#2272FF]/20 to-[#02F5D4]/20 text-white border border-white/10 shadow-lg shadow-[#02F5D4]/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn("transition-colors", activeTab === item.id ? "text-[#02F5D4]" : "text-white/40")}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              {activeTab === item.id && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 w-1 h-8 bg-gradient-to-b from-[#02F5D4] to-[#2272FF] rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-72 min-h-screen flex flex-col relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#050505]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-heading font-bold tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); if (!showNotif) marcarLeidas(); }}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bell size={18} className="text-white/70" />
                {noLeidas > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-white/[0.02] backdrop-blur-2xl border border-white/10 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 p-3 flex items-center justify-between">
                    <span className="text-white text-sm font-bold">Notificaciones</span>
                    {noLeidas > 0 && (
                      <button onClick={() => marcarLeidas()} className="text-[10px] text-[#02F5D4] hover:underline">
                        Marcar todas leídas
                      </button>
                    )}
                  </div>
                  {notificaciones.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-8">Sin notificaciones</p>
                  ) : (
                    notificaciones.map(n => (
                      <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!n.leida ? 'bg-[#02F5D4]/5' : ''}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.tipo === 'RECORDATORIO' ? 'bg-yellow-400' : n.tipo === 'VENCIMIENTO' ? 'bg-red-400' : 'bg-[#02F5D4]'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium">{n.titulo}</p>
                            <p className="text-white/50 text-xs mt-0.5">{n.mensaje}</p>
                            <p className="text-white/30 text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setEditTasa(!editTasa)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 transition-colors text-xs font-mono"
                >
                  <DollarSign size={12} className="text-emerald-400" />
                  {tasaUsd > 0 ? (
                    <span className="text-white">1 USD = {tasaUsd.toLocaleString()} CUP</span>
                  ) : (
                    <span className="text-slate-500">Configurar USD</span>
                  )}
                </button>
                {editTasa && (
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-4 w-64 rounded-2xl shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
                    <p className="text-slate-400 text-xs mb-2">1 USD = ? CUP</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={tasaInput}
                        onChange={(e) => setTasaInput(e.target.value)}
                        placeholder="Ej: 630"
                        className="flex-1 bg-transparent border border-white/20 px-3 py-2 text-white text-sm focus:border-[#02F5D4] focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleSaveTasa()}
                        autoFocus
                      />
                      <button onClick={handleSaveTasa}
                        className="px-4 py-2 bg-[#02F5D4] text-black text-xs font-bold hover:bg-[#02F5D4]/80 transition-colors">
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
