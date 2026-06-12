import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, ...props }, ref) => {
    return <Input ref={ref} className={cn("bg-white/[0.02]", className)} {...props} />
  }
)
AuthInput.displayName = "AuthInput"

export { AuthInput }
