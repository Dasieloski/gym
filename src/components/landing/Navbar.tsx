"use client"
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const navItems = [
    { name: "Inicio", href: "#hero" },
    { name: "Filosofía", href: "#filosofia" },
    { name: "Experiencia", href: "#experiencia" },
    { name: "Metodología", href: "#metodologia" },
    { name: "Membresía", href: "#membresia" },
    { name: "Testimonios", href: "#testimonios" },
    { name: "FAQ", href: "#faq" },
    { name: "Ubicación", href: "#ubicacion" },
]

export default function Navbar() {
    const [hidden, setHidden] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 150) {
            setHidden(true)
        } else {
            setHidden(false)
        }
    })

    return (
        <>
            <motion.nav
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: -100, opacity: 0 }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 md:px-8 flex items-center gap-8 shadow-2xl shadow-black/50">
                    {/* Logo */}
                    <Link href="/" className="font-heading font-bold text-lg tracking-tight text-white hover:opacity-80 transition-opacity">
                        GIMNASIO
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-[#02F5D4] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <Link href="/login/inicio" className="text-sm font-medium text-white hidden md:block opacity-60 hover:opacity-100 transition-opacity">
                            HOLA
                        </Link>
                        <Link href="/login/registrarse">
                            <button className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#02F5D4] transition-colors uppercase tracking-wide">
                                Unirse
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Icon (Floating separate from island if needed, or integrated) */}
            {/* For simplicity in this 'Island' design, we keep links hidden on mobile and just show CTA + potential Hamburger if needed. 
          Assuming 'Island' handles mobile by just showing CTA to join. 
      */}
        </>
    )
}
