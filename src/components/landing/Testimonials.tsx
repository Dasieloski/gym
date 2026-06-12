"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const testimonials = [
    { name: "María González", role: "Miembro desde 2023", text: "La mejor decisión de mi vida. El ambiente es increíble y los entrenadores realmente se preocupan por ti." },
    { name: "Carlos Ramos", role: "Atleta Híbrido", text: "Equipamiento de primer nivel. Aquí encontré todo lo que necesitaba para mi preparación de triatlón." },
    { name: "Laura Sánchez", role: "Miembro Premium", text: "El área de recuperación es un game changer. Poder tomarme un batido post-entreno es lo máximo." },
    { name: "David Díaz", role: "Bodybuilder", text: "Gimnasio serio, fierros de verdad y gente enfocada. Nada de distracciones." },
    { name: "Andrea P.", role: "Yoga Lover", text: "Las zonas de estiramiento son super amplias y relajantes. Me encanta venir por las mañanas." },
]

const testimoniesDisplay = [...testimonials, ...testimonials]

export default function Testimonials() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])

    return (
        <section id="testimonios" ref={containerRef} className="relative h-[150vh] bg-[#050505] overflow-hidden">
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center">
                <motion.div style={{ opacity }} className="pl-4 md:pl-10 lg:pl-20 mb-12 md:mb-20">
                    <h2 className="text-white text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4">Testimonios</h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-white leading-tight">
                        Comunidad <span className="text-transparent text-outline">Gimnasio</span>
                    </h3>
                </motion.div>

                <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                    <motion.div style={{ x }} className="flex gap-4 md:gap-6 pl-4 md:pl-10 lg:pl-20">
                        {testimoniesDisplay.map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} index={i} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="w-[350px] md:w-[450px] shrink-0 h-[50vh] md:h-[60vh] border-l border-white/20 p-6 md:p-8 flex flex-col justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
            <div>
                <span className="text-white/20 text-xs uppercase tracking-[0.2em] mb-4 block">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-1 h-1 bg-[#02F5D4] rounded-full" />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-white text-lg md:text-xl lg:text-2xl font-sans font-medium leading-relaxed mb-8">
                    &quot;{testimonial.text}&quot;
                </p>
                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white font-sans font-bold text-base md:text-lg">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm mt-1">{testimonial.role}</p>
                </div>
            </div>
        </motion.div>
    )
}
