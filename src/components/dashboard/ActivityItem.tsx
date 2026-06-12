"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { UserPlus, CreditCard, Calendar, AlertTriangle, UserCheck, LucideIcon } from "lucide-react"

interface ActivityItemProps {
  action: string
  description: string
  user: string
  time: string
  type?: "new_client" | "payment" | "booking" | "alert" | "membership" | "default"
  delay?: number
}

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  new_client: { icon: UserPlus, color: "#2272FF", bg: "bg-blue-500/10" },
  payment: { icon: CreditCard, color: "#10B981", bg: "bg-emerald-500/10" },
  booking: { icon: Calendar, color: "#02F5D4", bg: "bg-cyan-500/10" },
  alert: { icon: AlertTriangle, color: "#EF4444", bg: "bg-red-500/10" },
  membership: { icon: UserCheck, color: "#F59E0B", bg: "bg-amber-500/10" },
  default: { icon: UserCheck, color: "#02F5D4", bg: "bg-cyan-500/10" },
}

export default function ActivityItem({ action, description, user, time, type = "default", delay = 0 }: ActivityItemProps) {
  const config = typeConfig[type] || typeConfig.default
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200"
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
        <Icon size={14} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 font-sans font-medium truncate">{action}</p>
        <p className="text-xs text-white/40 font-sans truncate">{description}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-white/30 font-sans">{time}</p>
        <p className="text-[10px] text-white/50 font-sans truncate max-w-[80px]">{user}</p>
      </div>
    </motion.div>
  )
}
