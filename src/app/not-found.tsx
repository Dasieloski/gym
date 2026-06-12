"use client";

import { useState, useEffect } from 'react'
import { Dumbbell, Sun, Moon, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#2272FF] flex items-center transition-transform duration-300 hover:scale-105">
            <Dumbbell className="mr-2" />
            GIMNASIO
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <AlertTriangle size={64} className="mx-auto mb-6 text-[#2272FF] dark:text-[#25D366] animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-800 dark:text-gray-100 animate-fade-in-down">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2272FF] to-[#25D366]">
              404 - Página no encontrada
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-400 animate-fade-in-up leading-relaxed">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <Link href="/" className="inline-flex items-center px-8 py-4 bg-[#2272FF] text-white rounded-full hover:bg-[#1b5acc] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl animate-pulse hover:animate-none">
            <Home size={24} className="mr-3" />
            Volver a la página principal
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md transition-all duration-300 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 dark:text-gray-400">
          © 2023 GIMNASIO. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}