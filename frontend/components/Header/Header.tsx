'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Utensils, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Utensils className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-800">FineTable</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/menu" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Menu
            </Link>
            <Link href="/reservations" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Reservations
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Contact
            </Link>
          </nav>
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-primary focus:outline-none focus:text-primary"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link href="/menu" className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                Menu
              </Link>
              <Link href="/reservations" className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                Reservations
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}