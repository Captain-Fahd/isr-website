"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Hero() {
  const [logoPhase, setLogoPhase] = useState(0)

  const logoSources = [
    '/images/isr_logo_dark.JPG',
    '/images/isr_logo_gold.JPG',
    '/images/isr_logo_dark.jpg',
    '/images/isr_logo_gold.jpg',
    '/images/isr_logo_dark.jpeg',
    '/images/isr_logo_gold.jpeg',
    '/images/isr_logo_gold.png',
    '/images/isr_logo_dark.png',
  ]

  return (
    <section className="min-h-screen bg-gradient-to-br from-isr-cream via-white to-isr-yellow flex items-center justify-center py-20 px-4">
      <div className="container-isr text-center max-w-4xl mx-auto">
        {/* Brand mark */}
        <div className="mb-10 flex justify-center">
          {logoPhase < logoSources.length ? (
            <div className="relative rounded-[28px] bg-white/75 p-4 shadow-[0_16px_36px_rgba(91,11,5,0.08)] ring-1 ring-black/5 backdrop-blur-sm">
              <div className="absolute inset-x-6 top-1/2 h-10 -translate-y-1/2 rounded-full bg-isr-turquoise/10 blur-2xl" />
              <Image
                src={logoSources[logoPhase]}
                alt="ISR logo"
                width={220}
                height={150}
                className="relative z-10 mx-auto h-auto w-[170px] sm:w-[220px] object-contain"
                onError={() => setLogoPhase((current) => current + 1)}
                priority
              />
            </div>
          ) : (
            <div className="mx-auto inline-flex items-center justify-center rounded-full border border-isr-light-blue/40 bg-white/80 px-4 py-2 text-sm font-semibold tracking-[0.2em] text-isr-turquoise shadow-sm">
              ISR
            </div>
          )}
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-isr-dark-red">
          Islamic Society of RMIT
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-2xl text-isr-turquoise font-semibold mb-4">
          United in Faith, Community, and Purpose
        </p>

        {/* Description */}
        <p className="text-base md:text-lg text-gray-700 mb-12 leading-relaxed max-w-2xl mx-auto">
          ISR is an inclusive community for Muslim students at RMIT University. 
          We celebrate our faith through weekly Jumuah prayers, meaningful events, 
          and fostering a supportive network for all members.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/prayer-times"
            className="px-8 py-3 bg-isr-turquoise text-white font-semibold rounded-lg hover:bg-isr-dark-red transition-colors"
          >
            View Prayer Times
          </Link>
          <Link
            href="/events"
            className="px-8 py-3 border-2 border-isr-bright-red text-isr-bright-red font-semibold rounded-lg hover:bg-isr-bright-red hover:text-white transition-colors"
          >
            Explore Events
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-isr-light-blue border-opacity-30">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-isr-turquoise">Weekly</p>
            <p className="text-sm md:text-base text-gray-600">Jumuah Prayers</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-isr-bright-red">100+</p>
            <p className="text-sm md:text-base text-gray-600">Community Members</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-isr-dark-red">12+</p>
            <p className="text-sm md:text-base text-gray-600">Events Per Year</p>
          </div>
        </div>
      </div>
    </section>
  )
}
