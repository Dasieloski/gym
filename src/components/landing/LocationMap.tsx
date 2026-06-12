"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function LocationMap() {
    const containerRef = useRef(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])

    return (
        <section id="ubicacion" ref={containerRef} className="relative min-h-screen bg-[#050505] flex items-center py-20 md:py-40 overflow-hidden">
            <motion.div style={{ opacity }} className="container mx-auto px-4 md:px-10 lg:px-20 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                    <div>
                        <h2 className="text-white text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4">Ubicación</h2>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-white leading-tight mb-8 md:mb-12">
                            Encuéntranos <span className="text-transparent text-outline">Fácil</span>
                        </h3>

                        <div className="space-y-8">
                            <InfoBlock
                                label="Dirección"
                                content="Calle Principal #123, Centro"
                                subcontent="Ciudad, CP 12345"
                            />
                            <InfoBlock
                                label="Horarios"
                                content="Abierto 24/7"
                                subcontent="Recepción: 8:00 - 22:00"
                            />
                            <InfoBlock
                                label="Estacionamiento"
                                content="Gratuito para miembros"
                                subcontent="50 espacios + racks para bicicletas"
                            />
                            <InfoBlock
                                label="Transporte"
                                content="Metro: Estación Central (2 min)"
                                subcontent="Bus: Líneas 15, 23, 42"
                            />
                        </div>
                    </div>

                    <motion.div style={{ y }} className="relative h-[400px] md:h-[600px] bg-white/[0.02] border-l border-white/20">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.123456789!2d-82.3456789!3d23.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA3JzI0LjQiTiA4MsKwMjAnNDQuNCJX!5e0!3m2!1ses!2scu!4v1234567890"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación de Gimnasio"
                            className="grayscale contrast-125 brightness-50 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50 pointer-events-none" />
                        
                        <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-xl border border-white/10 p-6">
                            <p className="text-white font-sans font-bold text-lg mb-2">Gimnasio</p>
                            <p className="text-gray-400 text-sm">Calle Principal #123, Centro</p>
                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-[#02F5D4] text-sm font-medium border-b border-[#02F5D4]/30 hover:border-[#02F5D4] transition-colors pb-0.5"
                            >
                                Abrir en Google Maps →
                            </a>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

function InfoBlock({ label, content, subcontent }: { label: string; content: string; subcontent: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-l border-white/20 pl-6"
        >
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className="text-white text-lg md:text-xl font-sans font-medium">{content}</p>
            {subcontent && <p className="text-gray-400 text-sm md:text-base mt-1">{subcontent}</p>}
        </motion.div>
    )
}
