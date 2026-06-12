"use client"
import Link from 'next/link'

export default function SignatureFooter() {
    return (
        <footer className="relative min-h-screen bg-white text-black flex flex-col justify-between p-8 md:p-12 overflow-hidden">

            {/* Top Content */}
            <div className="flex justify-between items-start z-10 mix-blend-difference text-white md:text-black md:mix-blend-normal">
                <div>
                    <span className="block text-xs uppercase tracking-[0.2em] mb-2">Contacto</span>
                    <a href="mailto:hola@gimnasio.com" className="text-2xl md:text-4xl font-light hover:underline underline-offset-8 decoration-1">hola@gimnasio.com</a>
                </div>

                <div className="text-right">
                    <span className="block text-xs uppercase tracking-[0.2em] mb-2">Social</span>
                    <div className="flex flex-col gap-1">
                        <a href="#" className="text-sm font-bold uppercase hover:opacity-50">Instagram</a>
                        <a href="#" className="text-sm font-bold uppercase hover:opacity-50">Twitter</a>
                        <a href="#" className="text-sm font-bold uppercase hover:opacity-50">LinkedIn</a>
                    </div>
                </div>
            </div>

            {/* Center CTA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <Link href="/login/registrarse">
                    <button className="group relative px-12 py-6 overflow-hidden rounded-full bg-black text-white text-xl font-bold uppercase tracking-wider hover:scale-105 transition-transform duration-300">
                        <span className="relative z-10 group-hover:text-black transition-colors duration-300">Unirse Ahora</span>
                        <div className="absolute inset-0 bg-[#02F5D4] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                    </button>
                </Link>
            </div>

            {/* Bottom Giant Text */}
            <div className="relative w-full z-0 h-[30vh] md:h-[50vh] flex items-end justify-center pointer-events-none">
                <h1 className="text-[25vw] leading-[0.7] font-heading font-black tracking-tighter uppercase select-none">
                    Gimnasio
                </h1>
            </div>

        </footer>
    )
}
