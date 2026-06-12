"use client";

import { Home, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import Atmosphere from '@/components/landing/Atmosphere';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col relative">
      <Atmosphere />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#02F5D4]/50 transition-colors">
            <Dumbbell size={18} className="text-[#02F5D4]" />
          </div>
          <span className="text-white font-heading font-bold text-lg tracking-tight">ROSEN GYM</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#02F5D4] font-heading font-bold text-8xl md:text-9xl leading-none mb-4">404</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-xl md:text-2xl font-heading font-bold text-white mb-3">
              Página no encontrada
            </h1>
            <p className="text-white/40 text-sm font-sans mb-8 max-w-sm mx-auto leading-relaxed">
              La página que buscas no existe, fue movida o el enlace es incorrecto.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-[#02F5D4]/30 transition-all duration-300 group"
            >
              <Home size={16} className="group-hover:text-[#02F5D4] transition-colors" />
              Volver al inicio
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center py-6">
        <p className="text-white/20 text-xs font-sans">
          &copy; {new Date().getFullYear()} Rosen Gym. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
