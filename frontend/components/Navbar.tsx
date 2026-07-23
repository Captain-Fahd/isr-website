'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// Logo image files (place in `public/images/`): isr_logo_dark.JPG and isr_logo_gold.JPG

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoPhase, setLogoPhase] = useState(0)

  const logoSources = [
    '/images/isr_logo_dark.JPG',
    '/images/isr_logo_gold.JPG',
    '/images/isr_logo_dark.jpg',
    '/images/isr_logo_gold.jpg',
    '/images/isr_logo_dark.jpeg',
    '/images/isr_logo_gold.jpeg',
    '/images/isr_logo_dark.png',
    '/images/isr_logo_gold.png',
  ]

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/mission', label: 'Mission' },
    { href: '/events', label: 'Events' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container-isr">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {/** Load logo with a fallback sequence: dark -> gold -> common extensions -> badge */}
            {logoPhase < logoSources.length ? (
              <Image
                src={logoSources[logoPhase]}
                alt="ISR logo"
                width={40}
                height={40}
                className="object-contain rounded"
                onError={() => setLogoPhase((current) => current + 1)}
              />
            ) : (
              <div className="w-8 h-8 bg-isr-turquoise rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">ISR</span>
              </div>
            )}

            <span className="font-bold text-isr-dark-red text-lg hidden sm:inline">
              Islamic Society of RMIT
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-isr-turquoise transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://campus.hellorubric.com/?s=10733"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-isr-turquoise px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
            >
              Become a Member
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-isr-turquoise"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-isr-turquoise transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-3">
              <a
                href="https://campus.hellorubric.com/?s=10733"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-isr-turquoise px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Become a Member
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
