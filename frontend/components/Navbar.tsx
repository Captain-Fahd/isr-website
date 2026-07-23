'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// Logo: isr_logo_transparent.png in `public/images/`

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/mission', label: 'Mission' },
    { href: '/events', label: 'Events' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 pb-2">
      <div className="container-isr">
        <div
          className={`border border-isr-light-blue/30 bg-isr-cream/70 shadow-lg backdrop-blur-md transition-[border-radius] duration-300 ease-out ${
            isOpen ? 'rounded-3xl' : 'rounded-full'
          }`}
        >
        <div className="relative z-10 flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {/** Load logo with a fallback sequence: dark -> gold -> common extensions -> badge */}
            {!logoFailed ? (
              <Image
                src="/images/isr_logo_transparent.png"
                alt="ISR logo"
                width={40}
                height={40}
                className="object-contain"
                onError={() => setLogoFailed(true)}
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
              className="rounded-full bg-isr-turquoise px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
            >
              Become a Member
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-isr-turquoise"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu — drawer expands downward */}
        <div
          className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`border-t border-isr-light-blue/30 px-4 pb-4 transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
            >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
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
                className="block rounded-full bg-isr-turquoise px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Become a Member
              </a>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </nav>
  )
}
