"use client"

import Link from 'next/link'
import Image from 'next/image'
import PrayerTimesTable from '@/components/PrayerTimesTable'

const logoClassName =
  'relative z-10 mx-auto h-auto w-[140px] object-contain sm:w-[180px] lg:mx-0'

export default function Hero() {
  return (
    <section id="hero" className="flex min-h-screen items-center px-4 py-16 sm:py-20">
      <div className="container-isr w-full">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="relative rounded-[28px] bg-white/75 p-3 shadow-[0_16px_36px_rgba(91,11,5,0.08)] ring-1 ring-black/5 backdrop-blur-sm sm:p-4">
                <div className="absolute inset-x-6 top-1/2 h-10 -translate-y-1/2 rounded-full bg-isr-turquoise/10 blur-2xl" />
                {/* Mobile logos — match navbar (swapped vs desktop) */}
                <Image
                  src="/images/isr_logo_lightmode.png"
                  alt="ISR logo"
                  width={180}
                  height={120}
                  className={`${logoClassName} block dark:hidden md:hidden`}
                  priority
                />
                <Image
                  src="/images/isr_logo_darkmode.png"
                  alt="ISR logo"
                  width={180}
                  height={120}
                  className={`${logoClassName} hidden dark:block md:dark:hidden`}
                  priority
                />
                {/* Desktop logos */}
                <Image
                  src="/images/isr_logo_darkmode.png"
                  alt="ISR logo"
                  width={180}
                  height={120}
                  className={`${logoClassName} hidden md:block dark:md:hidden`}
                  priority
                />
                <Image
                  src="/images/isr_logo_lightmode.png"
                  alt="ISR logo"
                  width={180}
                  height={120}
                  className={`${logoClassName} hidden md:dark:block`}
                  priority
                />
              </div>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-isr-dark-red sm:text-4xl md:text-5xl lg:text-6xl">
              Islamic Society of RMIT
            </h1>

            <p className="mb-3 text-lg font-semibold text-isr-dark-red sm:text-xl">
              The Home of Muslim Students at RMIT
            </p>

            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <a
                href="https://campus.hellorubric.com/?s=10733"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-isr-turquoise px-8 py-3 font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Become a Member
              </a>
              <Link
                href="/volunteer/"
                className="rounded-lg bg-isr-dark-red px-8 py-3 font-semibold text-white transition-colors hover:bg-isr-bright-red"
              >
                Volunteer with ISR
              </Link>
              <Link
                href="/events/"
                className="rounded-lg border-2 border-isr-bright-red px-8 py-3 font-semibold text-isr-bright-red transition-colors hover:bg-isr-bright-red hover:text-white"
              >
                Explore Events
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <PrayerTimesTable />
          </div>
        </div>
      </div>
    </section>
  )
}
