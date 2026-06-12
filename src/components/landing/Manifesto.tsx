"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

export default function Manifesto() {
    const container = useRef(null)

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])

    return (
        <section id="filosofia" ref={container} className="relative min-h-[120vh] md:min-h-[150vh] flex items-center justify-center bg-[#050505] overflow-hidden py-20 md:py-40">

            {/* Floating Media (Parallax blended) */}
            <motion.div style={{ y }} className="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none">
                <div className="relative w-[30vw] h-[40vw] md:w-[20vw] md:h-[30vw] -rotate-12 translate-x-[-20vw] blend-overlay mix-blend-lighten">
                    <Image
                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
                        alt="Athlete"
                        fill
                        className="object-cover grayscale rounded-lg"
                        sizes="33vw"
                    />
                </div>
                <div className="relative w-[40vw] h-[25vw] rotate-6 translate-y-[20vh] blend-overlay mix-blend-lighten">
                    <Image
                        src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop"
                        alt="Structure"
                        fill
                        className="object-cover grayscale rounded-lg"
                        sizes="50vw"
                    />
                </div>
            </motion.div>

            {/* Scrub Text */}
            <div className="relative z-10 max-w-[95vw] md:max-w-5xl mx-auto text-center px-4 md:px-6">
                <Paragraph>
                    El cuerpo humano no fue diseñado para estar estático. Fue forjado en movimiento, esculpido por la resistencia y perfeccionado por el esfuerzo.
                </Paragraph>
                <div className="h-8 md:h-12" />
                <Paragraph>
                    En nuestro gimnasio, no vendemos membresías. Ofrecemos acceso a la mejor versión de tu propia biología. Ingeniería aplicada al rendimiento.
                </Paragraph>
            </div>

        </section>
    )
}

function Paragraph({ children }: { children: string }) {
    const element = useRef(null)
    const { scrollYProgress } = useScroll({
        target: element,
        offset: ["start 0.9", "start 0.25"]
    })

    const words = children.split(" ")

    return (
        <p
            ref={element}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-sans font-bold leading-tight flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-3 md:gap-x-5"
        >
            {words.map((word, i) => {
                const start = i / words.length
                const end = start + (1 / words.length)
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1])
                return (
                    <motion.span key={i} style={{ opacity }} className="relative text-white">
                        {word}
                    </motion.span>
                )
            })}
        </p>
    )
}
