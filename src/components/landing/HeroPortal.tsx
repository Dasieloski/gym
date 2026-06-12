"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import dynamic from 'next/dynamic'

const DumbbellScene = dynamic(() => import('@/components/three/DumbbellScene'), { ssr: false })

export default function HeroPortal() {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // The Portal Effect: Scaling from 1 to huge, effectively "entering" the text
    const scale = useTransform(scrollYProgress, [0, 1], [1, 50])
    const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0])
    const textBlur = useTransform(scrollYProgress, [0, 0.5], ["0px", "20px"])

    // Background Video/Media Parallax
    const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const mediaScale = useTransform(scrollYProgress, [0, 1], [1.1, 1])

    return (
        <section id="hero" ref={containerRef} className="relative h-[250vh] w-full z-10">

            {/* Sticky Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">

                {/* Background Media (Abstract Muscles/Form) */}
                <motion.div
                    style={{ y: mediaY, scale: mediaScale }}
                    className="absolute inset-0 w-full h-full z-0"
                >
                    {/* Fallback gradient if video not available, or replace with abstract video */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black" />
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 brightness-50" />
                </motion.div>

                {/* 3D Dumbbell - Floating beside text on desktop */}
                <div className="absolute inset-0 z-[15] pointer-events-none hidden lg:block">
                    <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[400px] h-[400px]">
                        <DumbbellScene scrollY={0} />
                    </div>
                </div>

                {/* The Portal Text */}
                <motion.div
                    style={{ scale, opacity, filter: `blur(${textBlur})` }}
                    className="relative z-20 flex flex-col items-center mix-blend-difference"
                >
                    <h1 className="text-[12vw] font-black tracking-tighter text-white leading-none uppercase text-center select-none shadow-2xl">
                        Gimnasio
                    </h1>
                    <h1 className="text-[12vw] font-black tracking-tighter text-outline-thick text-transparent leading-none uppercase text-center select-none">
                        Fitness
                    </h1>
                </motion.div>

                {/* Entrance Invitation */}
                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
                    className="absolute bottom-10 z-30 flex flex-col items-center gap-2"
                >
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 backdrop-blur-sm px-4 py-1 rounded-full border border-white/10">
                        Entrar al sistema
                    </div>
                </motion.div>
            </div>

        </section>
    )
}
