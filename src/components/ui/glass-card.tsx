"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  onClick?: () => void
  hover?: boolean
  glow?: "cyan" | "blue" | "purple" | "none"
  intense?: boolean
}

export default function GlassCard({ children, className = "", delay = 0, onClick, hover = true, glow = "cyan", intense = false }: GlassCardProps) {
  const glowColors = {
    cyan: "from-[#02F5D4]/10 via-transparent to-[#02F5D4]/5",
    blue: "from-[#2272FF]/10 via-transparent to-[#2272FF]/5",
    purple: "from-purple-500/10 via-transparent to-[#2272FF]/5",
    none: ""
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-2xl",
        "bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01]",
        "border border-white/[0.08]",
        "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
        hover && "hover:border-white/[0.15] hover:shadow-[0_8px_32px_-8px_rgba(2,245,212,0.15)]",
        hover && "transition-all duration-500 ease-out",
        intense && "border-white/[0.12] shadow-[0_8px_32px_-8px_rgba(2,245,212,0.08)]",
        className
      )}
    >
      {/* Premium gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03] pointer-events-none" />
      
      {/* Animated glow on hover */}
      {hover && glow !== "none" && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none",
          glowColors[glow]
        )} />
      )}
      
      {/* Top highlight line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
