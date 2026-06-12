"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: string
  gradient?: string
  delay?: number
  trend?: { value: number; positive: boolean }
  className?: string
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "#02F5D4",
  gradient = "from-[#02F5D4]/20 to-[#2272FF]/20",
  delay = 0,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10",
        "shadow-2xl shadow-black/50 hover:border-white/20 transition-colors duration-300",
        className
      )}
    >
      {/* Glow effect */}
      <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br", gradient)} />
      <div className={cn("absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br", gradient)} />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 bg-gradient-to-br"
            style={{ backgroundImage: `linear-gradient(135deg, ${color}15, ${color}05)` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              trend.positive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {trend.positive ? "+" : ""}{trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-white/40 text-[10px] sm:text-xs font-sans uppercase tracking-wider">{title}</p>
          <motion.h3
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight"
          >
            {value}
          </motion.h3>
          {subtitle && (
            <p className="text-white/40 text-xs font-sans">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
