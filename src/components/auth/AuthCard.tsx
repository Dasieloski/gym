"use client"

import { cn } from "@/lib/utils"
import GlassCard from "@/components/ui/glass-card"

interface AuthCardProps {
  children: React.ReactNode
  className?: string
}

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <GlassCard className={cn("w-full max-w-md p-6 md:p-8", className)}>
      {children}
    </GlassCard>
  )
}
