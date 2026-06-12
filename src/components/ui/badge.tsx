import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "blue"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const styles = {
    default: "bg-white/10 text-white/60",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-[#02F5D4]/10 text-[#02F5D4] border-[#02F5D4]/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }

  return (
    <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", styles[variant], className)}>
      {children}
    </span>
  )
}
