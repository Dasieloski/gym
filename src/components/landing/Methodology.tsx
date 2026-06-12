"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

const methods = [
    { title: "Bio-Rhythm", num: "01", desc: "Sincronización circadiana de luz y temperatura." },
    { title: "Hyper-Trophy", num: "02", desc: "Resistencia variable controlada por IA." },
    { title: "Cryo-Genics", num: "03", desc: "Recuperación bajo cero para optimización celular." },
    { title: "Neuro-Link", num: "04", desc: "Biofeedback en tiempo real durante el esfuerzo." }
]

export default function Methodology() {
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: targetRef })
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])

    return (
        <section id="metodologia" ref={targetRef} className="relative h-[300vh] bg-[#050505]">
            <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden pl-4 md:pl-10 lg:pl-20">

                <div className="absolute top-10 left-4 md:top-20 md:left-20 z-10 mix-blend-difference max-w-[90vw] md:max-w-xl">
                    <h2 className="text-white text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4">Metodología</h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-white leading-tight">
                        Ingeniería <span className="text-transparent text-outline">Humana</span>
                    </h3>
                </div>

                <motion.div style={{ x }} className="flex gap-4 md:gap-6 lg:gap-10 pl-[30vw] sm:pl-[35vw] md:pl-[40vw]">
                    {methods.map((m, i) => (
                        <MethodCard key={i} m={m} />
                    ))}
                </motion.div>

            </div>
        </section>
    )
}

function MethodCard({ m }: any) {
    const [hover, setHover] = useState(false)

    return (
        <motion.div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            animate={{
                width: hover ? "min(45vw, 600px)" : "min(70vw, 280px)",
                backgroundColor: hover ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)"
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 h-[55vh] sm:h-[60vh] md:h-[65vh] border-l border-white/20 p-4 sm:p-6 md:p-8 flex flex-col justify-between cursor-pointer relative overflow-hidden"
        >
            <span className="text-6xl sm:text-7xl md:text-8xl text-white/10 font-black">{m.num}</span>

            <div className="relative z-10">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-heading uppercase text-white mb-2 md:mb-4 leading-tight">{m.title}</h4>
                <motion.p
                    animate={{ opacity: hover ? 1 : 0.7, y: hover ? 0 : 10 }}
                    className="text-gray-300 md:text-gray-400 text-sm sm:text-base md:text-lg max-w-sm line-clamp-3 md:line-clamp-none"
                >
                    {m.desc}
                </motion.p>
            </div>

            {hover && (
                <motion.div
                    layoutId="highlight"
                    className="absolute inset-0 bg-blue-500/10 blur-xl -z-0"
                />
            )}
        </motion.div>
    )
}
