"use client"
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

interface AtmosphereProps {
    spotlightColor?: string
    spotlightSize?: string
    showParticles?: boolean
}

export default function Atmosphere({
    spotlightColor = 'rgba(255,255,255,0.08)',
    spotlightSize = '800px',
    showParticles = true,
}: AtmosphereProps) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    useEffect(() => {
        const handleMove = ({ clientX, clientY }: MouseEvent) => {
            mouseX.set(clientX)
            mouseY.set(clientY)
        }
        window.addEventListener('mousemove', handleMove)
        return () => window.removeEventListener('mousemove', handleMove)
    }, [mouseX, mouseY])

    const radius = parseInt(spotlightSize) / 2

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
            <div className="absolute inset-0 opacity-[0.07] bg-[url('/noise.svg')] bg-repeat mix-blend-overlay z-50 text-white" />

            <motion.div
                style={{ x: useSpring(x, { ...springConfig, damping: 100 }), y: useSpring(y, { ...springConfig, damping: 100 }) }}
                className="absolute -inset-[20%] opacity-30 mix-blend-screen"
            >
                <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[#1a0b2e] blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] rounded-full bg-[#031d1a] blur-[120px]" />
            </motion.div>

            <motion.div
                style={{
                    left: x,
                    top: y,
                    width: spotlightSize,
                    height: spotlightSize,
                    background: useMotionTemplate`radial-gradient(circle ${radius}px at center, ${spotlightColor}, transparent 80%)`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 mix-blend-soft-light z-30"
            />

            {showParticles && (
                <div className="absolute inset-0 z-10">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white/10 blur-[1px]"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 4 + 1}px`,
                                height: `${Math.random() * 4 + 1}px`,
                                animation: `float ${Math.random() * 10 + 20}s infinite linear`,
                                opacity: Math.random() * 0.5
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
