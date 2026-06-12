"use client"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

const buttonVariants = cva(
  "relative group/btn overflow-hidden font-bold font-heading uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white hover:shadow-lg hover:shadow-[#02F5D4]/30",
        primary: "bg-gradient-to-r from-[#2272FF] to-[#02F5D4] text-white hover:shadow-lg hover:shadow-[#02F5D4]/30",
        secondary: "border border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-transparent",
        destructive: "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400",
        danger: "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400",
        ghost: "bg-white/5 hover:bg-white/10 text-white border-none",
        outline: "border border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-transparent",
        link: "text-[#02F5D4] hover:text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-3 text-xs rounded-xl",
        sm: "px-4 py-2 text-[10px] rounded-lg",
        md: "px-6 py-3 text-xs rounded-xl",
        lg: "px-8 py-4 text-sm rounded-xl",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {(variant === "default" || variant === "primary" || !variant) && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#02F5D4] to-[#2272FF] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        )}
        <span className="relative flex items-center gap-2">
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {children}
        </span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
