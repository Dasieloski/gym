"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AlertTriangle, Clock, CheckCircle, TrendingUp, LucideIcon } from "lucide-react"

interface AlertCardProps {
  title: string
  count: number
  subtitle?: string
  type?: "warning" | "danger" | "success" | "info"
  delay?: number
  className?: string
}

const typeConfig = {
  warning: { icon: Clock, color: "#F59E0B", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  danger: { icon: AlertTriangle, color: "#EF4444", bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
  success: { icon: CheckCircle, color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  info: { icon: TrendingUp, color: "#02F5D4", bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
}

export default function AlertCard({ title, count, subtitle, type = "info", delay = 0, className = "" }: AlertCardProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
        config.bg,
        config.border,
        className
      )}
    >
      <div className="relative z-10 p-4 flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", config.bg, config.border)}>
          <Icon size={18} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-sans font-medium uppercase tracking-wider", config.text)}>{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-heading font-bold text-white">{count}</span>
            {subtitle && <span className="text-white/40 text-xs font-sans truncate">{subtitle}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
