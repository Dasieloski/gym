"use client"
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'

const socialPosts = [
    {
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
        caption: 'Transformación del mes',
        tag: '#FitnessGoals'
    },
    {
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop',
        caption: 'Nueva zona de cardio',
        tag: '#Cardio'
    },
    {
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
        caption: 'Clase de spinning llena',
        tag: '#Spinning'
    },
    {
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1623874514711-0f321325f318?q=80&w=600&auto=format&fit=crop',
        caption: 'Área de pesas libres',
        tag: '#Strength'
    },
    {
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop',
        caption: 'Entrenamiento funcional',
        tag: '#Functional'
    },
    {
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop',
        caption: 'Comunidad Fitness',
        tag: '#Community'
    }
]

export default function SocialFeed() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])

    return (
        <section id="social" ref={containerRef} className="relative h-[200vh] bg-[#050505]">
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
                <motion.div style={{ opacity }} className="pl-4 md:pl-10 lg:pl-20 mb-12 md:mb-20">
                    <h2 className="text-white text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4">Social</h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-white leading-tight">
                        Comunidad <span className="text-transparent text-outline">Fitness</span>
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base mt-4 max-w-md">
                        Síguenos en @GimnasioFitness y únete a nuestra comunidad de +15K miembros
                    </p>
                </motion.div>

                <motion.div style={{ x }} className="flex gap-4 md:gap-6 pl-4 md:pl-10 lg:pl-20">
                    {socialPosts.map((post, i) => (
                        <SocialCard key={i} post={post} index={i} />
                    ))}
                </motion.div>

                <div className="pl-4 md:pl-10 lg:pl-20 mt-12 md:mt-20">
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-sm md:text-base font-medium border-b border-white/30 hover:border-[#02F5D4] hover:text-[#02F5D4] transition-colors pb-1"
                    >
                        Ver más en Instagram →
                    </a>
                </div>
            </div>
        </section>
    )
}

function SocialCard({ post, index }: { post: typeof socialPosts[0]; index: number }) {
    const [hover, setHover] = useState(false)

    return (
        <motion.a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            animate={{
                width: hover ? "min(40vw, 500px)" : "min(60vw, 280px)",
            }}
            className="flex-shrink-0 h-[50vh] md:h-[60vh] border-l border-white/20 relative overflow-hidden cursor-pointer group"
        >
            <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 60vw, 40vw"
            />
            
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-colors duration-500" />

            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs uppercase tracking-[0.2em]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <motion.span
                        animate={{ opacity: hover ? 1 : 0.6 }}
                        className="text-[#02F5D4] text-xs uppercase tracking-[0.2em]"
                    >
                        Instagram
                    </motion.span>
                </div>

                <div>
                    <motion.h4
                        animate={{ opacity: hover ? 1 : 0.8, y: hover ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-white text-xl md:text-2xl lg:text-3xl font-sans font-bold mb-2"
                    >
                        {post.caption}
                    </motion.h4>
                    <motion.p
                        animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 10 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="text-[#02F5D4] text-sm"
                    >
                        {post.tag}
                    </motion.p>
                </div>
            </div>

            {hover && (
                <motion.div
                    layoutId="social-highlight"
                    className="absolute inset-0 bg-[#02F5D4]/5 blur-xl -z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
        </motion.a>
    )
}
