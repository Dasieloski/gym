"use client"
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'

const faqs = [
    {
        question: "¿Cuáles son los horarios de apertura?",
        answer: "Estamos abiertos las 24 horas del día, los 7 días de la semana. Puedes entrenar cuando mejor se adapte a tu estilo de vida."
    },
    {
        question: "¿Puedo probar el gimnasio antes de inscribirme?",
        answer: "Sí, ofrecemos un pase de prueba gratuito de un día. Solo necesitas registrarte en recepción con tu documento de identidad."
    },
    {
        question: "¿Hay clases grupales incluidas en la membresía?",
        answer: "Las clases grupales están incluidas en las membresías Pro y Elite. La membresía Essential da acceso solo al área de entrenamiento libre."
    },
    {
        question: "¿Ofrecen entrenador personal?",
        answer: "Sí, todos nuestros planes incluyen acceso a entrenadores certificados. La membresía Elite incluye un entrenador personal y sesiones 1-a-1."
    },
    {
        question: "¿Puedo congelar mi membresía?",
        answer: "Sí, puedes congelar tu membresía por hasta 30 días al año sin costo adicional. Solo necesitas notificar con 7 días de anticipación."
    },
    {
        question: "¿Hay estacionamiento disponible?",
        answer: "Sí, contamos con estacionamiento gratuito para todos los miembros. También hay racks para bicicletas."
    },
    {
        question: "¿Qué incluye el área de recuperación?",
        answer: "El área de recuperación incluye sauna, baño de vapor, crioterapia, terapia de luz roja y zona de estiramiento. Disponible en membresías Pro y Elite."
    },
    {
        question: "¿Puedo traer invitados?",
        answer: "Los miembros Elite pueden traer hasta 2 invitados VIP al mes sin costo. Otros planes pueden comprar pases diarios para invitados."
    }
]

export default function FAQ() {
    const containerRef = useRef(null)
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])

    return (
        <section id="faq" ref={containerRef} className="relative min-h-screen bg-[#050505] flex items-center py-20 md:py-40">
            <motion.div style={{ opacity }} className="container mx-auto px-4 md:px-10 lg:px-20 max-w-6xl">
                <div className="mb-16 md:mb-24">
                    <h2 className="text-white text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4">FAQ</h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-white leading-tight">
                        Preguntas <span className="text-transparent text-outline">Frecuentes</span>
                    </h3>
                </div>

                <div className="space-y-0">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            index={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                <div className="mt-16 md:mt-24">
                    <p className="text-gray-400 text-sm md:text-base mb-4">
                        ¿Tienes más preguntas?
                    </p>
                    <a
                        href="mailto:hola@gimnasio.com"
                        className="text-white text-sm md:text-base font-medium border-b border-white/30 hover:border-white transition-colors pb-1"
                    >
                        Contáctanos →
                    </a>
                </div>
            </motion.div>
        </section>
    )
}

function FAQItem({ index, question, answer, isOpen, onToggle }: {
    index: number
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="border-t border-white/10 last:border-b"
        >
            <button
                onClick={onToggle}
                className="w-full py-6 md:py-8 flex items-start justify-between text-left group"
                aria-expanded={isOpen}
            >
                <div className="flex items-start gap-4 md:gap-6">
                    <span className="text-white/20 text-sm md:text-base font-mono mt-1">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white text-lg md:text-xl lg:text-2xl font-sans font-medium group-hover:text-[#02F5D4] transition-colors">
                        {question}
                    </span>
                </div>
                <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#02F5D4] text-2xl md:text-3xl flex-shrink-0 ml-4"
                >
                    +
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 md:pb-8 pl-10 md:pl-14 text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed max-w-3xl">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
