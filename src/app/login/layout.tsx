import type { ReactNode } from "react"
import Atmosphere from "@/components/landing/Atmosphere"

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col relative">
      <Atmosphere />
      <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
