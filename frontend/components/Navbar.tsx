'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events/', label: 'Events' },
    { href: '/announcements/', label: 'Announcements' },
    { href: '/prayer-times/', label: 'Prayer' },
    { href: '/about/', label: 'About' },
    { href: '/contact/', label: 'Contact' },
  ]

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 pb-2">
        {/* Fixed-height track: the pill overlays it so opening the drawer
            never changes the navbar's layout height. */}
        <div className="relative h-14">
          {/* Radius is pinned to half the bar height (h-14) so the pill shape
              never changes as the drawer grows — only the bottom edge moves. */}
          <div className="absolute inset-x-0 top-0 overflow-hidden rounded-[1.75rem] border border-isr-light-blue/30 bg-isr-cream/70 shadow-lg backdrop-blur-md">
            <div className="relative z-10 flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                {/* Mobile logos (swapped) */}
                <Image
                  src="/images/isr_logo_lightmode.png"
                  alt="ISR logo"
                  width={40}
                  height={40}
                  className="object-contain block dark:hidden md:hidden"
                />
                <Image
                  src="/images/isr_logo_darkmode.png"
                  alt="ISR logo"
                  width={40}
                  height={40}
                  className="object-contain hidden dark:block md:dark:hidden"
                />
                {/* Desktop logos */}
                <Image
                  src="/images/isr_logo_darkmode.png"
                  alt="ISR logo"
                  width={40}
                  height={40}
                  className="object-contain hidden md:block dark:md:hidden"
                />
                <Image
                  src="/images/isr_logo_lightmode.png"
                  alt="ISR logo"
                  width={40}
                  height={40}
                  className="object-contain hidden md:dark:block"
                />

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
                    className="text-sm font-medium text-gray-700 hover:text-isr-dark-red transition-colors min-h-11 inline-flex items-center"
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
                className="md:hidden flex h-11 w-11 items-center justify-center text-isr-turquoise"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu — drawer expands vertically downward */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`border-t border-isr-light-blue/30 px-4 pb-4 transition-all duration-300 ease-out ${
                    isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                  }`}
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block min-h-11 px-4 py-3 text-sm font-medium text-gray-700 hover:text-isr-dark-red transition-colors"
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
      {/* Reserves the same space as the fixed nav (pt-4 + h-14 + pb-2 = 5rem) */}
      <div className="h-20 shrink-0" aria-hidden="true" />
    </>
  )
}
