"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function MembershipArquitecture() {
    const container = useRef(null)

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end start"]
    })

    const y1 = useTransform(scrollYProgress, [0, 1], ["50%", "-20%"])
    const y2 = useTransform(scrollYProgress, [0, 1], ["80%", "-50%"])
    const y3 = useTransform(scrollYProgress, [0, 1], ["40%", "-10%"])

    return (
        <section id="membresia" ref={container} className="relative min-h-screen bg-[#050505] flex flex-col md:flex-row items-end justify-center md:gap-4 lg:gap-12 px-4 pb-20 md:pb-32 overflow-hidden z-10">

            {/* Background Title */}
            <div className="absolute top-[10%] md:top-[20%] w-full text-center z-0">
                <h2 className="text-[15vw] md:text-[20vw] !font-black leading-none text-[#0a0a0a] uppercase select-none">Access</h2>
            </div>

            {/* Mobile: Horizontal Scroll Container */}
            <div className="md:hidden w-full overflow-x-auto pb-8 pt-20 snap-x snap-mandatory scrollbar-hide">
                <div className="flex gap-4 px-4 min-w-max">
                    <MobileColumn y={y1} title="Essential" price="$25/m" color="bg-zinc-900">
                        <ul>
                            <li className="py-3 border-b border-white/10">Acceso 24/7 al gimnasio</li>
                            <li className="py-3 border-b border-white/10">App de seguimiento de progreso</li>
                            <li className="py-3 border-b border-white/10">Lockers básicos</li>
                            <li className="py-3 border-b border-white/10">Duchas y vestidores</li>
                            <li className="py-3 border-b border-white/10">Estacionamiento gratuito</li>
                            <li className="py-3 border-b border-white/10">WiFi de alta velocidad</li>
                        </ul>
                    </MobileColumn>

                    <MobileColumn y={y2} title="Elite" price="$80/m" color="bg-[#EAEAEA]" textColor="text-black" isMain>
                        <ul>
                            <li className="py-3 border-b border-black/10">Todo lo de Essential +</li>
                            <li className="py-3 border-b border-black/10">Entrenador personal certificado</li>
                            <li className="py-3 border-b border-black/10">Plan nutricional personalizado</li>
                            <li className="py-3 border-b border-black/10">Acceso a sauna y vapor</li>
                            <li className="py-3 border-b border-black/10">2 invitados VIP al mes</li>
                            <li className="py-3 border-b border-black/10">Clases grupales ilimitadas</li>
                            <li className="py-3 border-b border-black/10">Evaluaciones físicas mensuales</li>
                        </ul>
                    </MobileColumn>

                    <MobileColumn y={y3} title="Pro" price="$45/m" color="bg-zinc-800">
                        <ul>
                            <li className="py-3 border-b border-white/10">Todo lo de Essential +</li>
                            <li className="py-3 border-b border-white/10">Clases grupales ilimitadas</li>
                            <li className="py-3 border-b border-white/10">Crioterapia y recuperación</li>
                            <li className="py-3 border-b border-white/10">Terapia de luz roja</li>
                            <li className="py-3 border-b border-white/10">Área de estiramiento premium</li>
                            <li className="py-3 border-b border-white/10">1 invitado al mes</li>
                        </ul>
                    </MobileColumn>
                </div>
            </div>

            {/* Desktop: Original Layout */}
            <div className="hidden md:flex w-full items-end justify-center gap-4 lg:gap-12">
                {/* Column 1 */}
                <Column y={y1} title="Essential" price="$25/m" color="bg-zinc-900">
                    <ul>
                        <li className="py-4 border-b border-white/10">Acceso 24/7 al gimnasio</li>
                        <li className="py-4 border-b border-white/10">App de seguimiento de progreso</li>
                        <li className="py-4 border-b border-white/10">Lockers básicos</li>
                        <li className="py-4 border-b border-white/10">Duchas y vestidores</li>
                        <li className="py-4 border-b border-white/10">Estacionamiento gratuito</li>
                        <li className="py-4 border-b border-white/10">WiFi de alta velocidad</li>
                    </ul>
                </Column>

                {/* Column 2 (Active/Huge) */}
                <Column y={y2} title="Elite" price="$80/m" color="bg-[#EAEAEA]" textColor="text-black" isMain>
                    <ul>
                        <li className="py-4 border-b border-black/10">Todo lo de Essential +</li>
                        <li className="py-4 border-b border-black/10">Entrenador personal certificado</li>
                        <li className="py-4 border-b border-black/10">Plan nutricional personalizado</li>
                        <li className="py-4 border-b border-black/10">Acceso a sauna y vapor</li>
                        <li className="py-4 border-b border-black/10">2 invitados VIP al mes</li>
                        <li className="py-4 border-b border-black/10">Clases grupales ilimitadas</li>
                        <li className="py-4 border-b border-black/10">Evaluaciones físicas mensuales</li>
                    </ul>
                </Column>

                {/* Column 3 */}
                <Column y={y3} title="Pro" price="$45/m" color="bg-zinc-800">
                    <ul>
                        <li className="py-4 border-b border-white/10">Todo lo de Essential +</li>
                        <li className="py-4 border-b border-white/10">Clases grupales ilimitadas</li>
                        <li className="py-4 border-b border-white/10">Crioterapia y recuperación</li>
                        <li className="py-4 border-b border-white/10">Terapia de luz roja</li>
                        <li className="py-4 border-b border-white/10">Área de estiramiento premium</li>
                        <li className="py-4 border-b border-white/10">1 invitado al mes</li>
                    </ul>
                </Column>
            </div>

        </section>
    )
}

function Column({ y, title, price, color, textColor = "text-white", children, isMain = false }: any) {
    return (
        <motion.div
            style={{ y }}
            className={`relative w-full md:w-[25vw] ${isMain ? 'h-[70vh] z-20 shadow-2xl shadow-[#02F5D4]/20' : 'h-[50vh] z-10 opacity-70'} ${color} ${textColor} p-6 md:p-8 flex flex-col justify-between rounded-t-3xl`}
        >
            <div>
                <h3 className="text-3xl md:text-4xl font-heading uppercase">{title}</h3>
                <span className="text-lg md:text-xl opacity-60">Mensual</span>
            </div>

            <div className="font-sans text-xs md:text-sm font-medium">
                {children}
            </div>

            <div className="text-4xl md:text-6xl font-black tracking-tighter self-end">
                {price}
            </div>
        </motion.div>
    )
}

// Mobile-optimized column without parallax
function MobileColumn({ y, title, price, color, textColor = "text-white", children, isMain = false }: any) {
    return (
        <div
            className={`relative w-[85vw] snap-center flex-shrink-0 ${isMain ? 'h-[65vh] shadow-2xl shadow-[#02F5D4]/20' : 'h-[55vh]'} ${color} ${textColor} p-6 flex flex-col justify-between rounded-t-3xl`}
        >
            <div>
                <h3 className="text-3xl font-heading uppercase mb-1">{title}</h3>
                <span className="text-base opacity-60">Mensual</span>
            </div>

            <div className="font-sans text-sm font-medium flex-grow overflow-y-auto">
                {children}
            </div>

            <div className="text-5xl font-black tracking-tighter self-end mt-4">
                {price}
            </div>
        </div>
    )
}
