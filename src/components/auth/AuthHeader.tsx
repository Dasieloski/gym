"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function AuthHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <Link href="/" className="inline-block group">
        <h1 className="text-4xl font-heading font-black tracking-tighter text-white mb-1 group-hover:text-[#02F5D4] transition-colors duration-300">
          GIMNASIO
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-sans">Gimnasio</p>
      </Link>
    </motion.div>
  )
}
