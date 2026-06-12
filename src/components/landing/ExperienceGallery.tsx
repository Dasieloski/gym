"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

export default function ExperienceGallery() {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <section id="experiencia" ref={containerRef} className="relative h-[400vh] md:h-[400vh] bg-[#050505]">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1000px]">

                {/* Center Title */}
                <div className="z-50 text-center mix-blend-difference pb-20">
                    <h2 className="text-white text-5xl sm:text-7xl md:text-9xl font-heading font-black tracking-tighter uppercase">Power</h2>
                    <h2 className="text-transparent text-outline text-5xl sm:text-7xl md:text-9xl font-heading font-black tracking-tighter uppercase">Space</h2>
                </div>

                {/* Desktop: 3D Tunnel Elements */}
                <div className="hidden md:block">
                    <TunnelImage
                        src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                        alt="Zona de cardio con equipos de última generación"
                        caption="Zona Cardio"
                        progress={scrollYProgress}
                        range={[0, 0.25]}
                        startZ={-1000}
                        endZ={500}
                        x="-30vw"
                        y="-10vh"
                        className="w-[400px] h-[300px]"
                    />

                    <TunnelImage
                        src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop"
                        alt="Área de clases grupales de spinning"
                        caption="Clases Grupales"
                        progress={scrollYProgress}
                        range={[0.15, 0.40]}
                        startZ={-1000}
                        endZ={500}
                        x="30vw"
                        y="20vh"
                        className="w-[400px] h-[300px]"
                    />

                    <TunnelImage
                        src="https://images.unsplash.com/photo-1623874514711-0f321325f318?q=80&w=2070&auto=format&fit=crop"
                        alt="Zona de pesas libres con mancuernas y barras olímpicas"
                        caption="Pesas Libres"
                        progress={scrollYProgress}
                        range={[0.3, 0.55]}
                        startZ={-1000}
                        endZ={500}
                        x="0vw"
                        y="-30vh"
                        className="w-[400px] h-[300px]"
                    />

                    <TunnelImage
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"
                        alt="Vista panorámica del gimnasio con todas las áreas"
                        caption="Espacio Principal"
                        progress={scrollYProgress}
                        range={[0.45, 0.7]}
                        startZ={-1000}
                        endZ={800}
                        x="0vw"
                        y="0vh"
                        scale={1.5}
                        className="w-[400px] h-[300px]"
                    />
                </div>

                {/* Mobile: Simplified vertical scroll */}
                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center gap-8 px-4">
                    <MobileImage
                        src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                        alt="Zona de cardio con equipos de última generación"
                        caption="Zona Cardio"
                        progress={scrollYProgress}
                        range={[0, 0.25]}
                    />
                    <MobileImage
                        src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop"
                        alt="Área de clases grupales de spinning"
                        caption="Clases Grupales"
                        progress={scrollYProgress}
                        range={[0.25, 0.5]}
                    />
                    <MobileImage
                        src="https://images.unsplash.com/photo-1623874514711-0f321325f318?q=80&w=2070&auto=format&fit=crop"
                        alt="Zona de pesas libres con mancuernas y barras olímpicas"
                        caption="Pesas Libres"
                        progress={scrollYProgress}
                        range={[0.5, 0.75]}
                    />
                    <MobileImage
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"
                        alt="Vista panorámica del gimnasio con todas las áreas"
                        caption="Espacio Principal"
                        progress={scrollYProgress}
                        range={[0.75, 1]}
                    />
                </div>
            </div>
        </section>
    )
}

function TunnelImage({ src, alt, caption, progress, range, startZ, endZ, x, y, scale = 1, className = "" }: any) {
    const z = useTransform(progress, range, [startZ, endZ])
    const opacity = useTransform(progress, [range[0], range[0] + 0.05, range[1] - 0.05, range[1]], [0, 1, 1, 0])

    return (
        <motion.div
            style={{
                z,
                x,
                y,
                opacity,
                scale,
                rotateX: useTransform(progress, range, [10, -10]),
                rotateY: useTransform(progress, range, [-5, 5])
            }}
            className={`absolute bg-gray-800 rounded-xl overflow-hidden shadow-2xl origin-center ${className}`}
        >
            <Image src={src} alt={alt} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold text-lg">{caption}</p>
            </div>
        </motion.div>
    )
}

function MobileImage({ src, alt, caption, progress, range }: any) {
    const opacity = useTransform(progress, [range[0], range[0] + 0.1, range[1] - 0.1, range[1]], [0, 1, 1, 0])
    const y = useTransform(progress, range, [100, -100])

    return (
        <motion.div
            style={{ opacity, y }}
            className="relative w-full max-w-[300px] h-[200px] bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
        >
            <Image src={src} alt={alt} fill className="object-cover" sizes="300px" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold text-base">{caption}</p>
            </div>
        </motion.div>
    )
}
