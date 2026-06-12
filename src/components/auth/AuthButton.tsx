import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  icon?: React.ReactNode
}

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, isLoading, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "w-full relative group/btn overflow-hidden bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white px-5 py-3 rounded-xl font-bold font-heading uppercase tracking-wider text-xs hover:shadow-lg hover:shadow-[#02F5D4]/30 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#02F5D4] to-[#2272FF] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-2">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : icon}
          {children}
        </span>
      </button>
    )
  }
)
AuthButton.displayName = "AuthButton"

export { AuthButton }
