'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight } from '@/components/Icons'
import { useCommunityFormsPage } from '@/lib/communityFormsPage'

const ctaClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red'

export default function ConnectPageClient() {
  const { page, loading } = useCommunityFormsPage()

  if (loading && !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-isr-cream">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-isr-dark-red border-t-transparent" />
      </div>
    )
  }

  if (!page || !page.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
        <Navbar />
        <main className="px-4 pb-16 pt-24 text-center sm:pt-28">
          <div className="container-isr">
            <h1 className="mb-4 text-3xl font-bold text-isr-dark-red">This page isn&rsquo;t available right now</h1>
            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-gray-600">
              Check back later, or head back to the home page.
            </p>
            <Link href="/" className={ctaClass}>
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {page.title}
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            {page.intro && (
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
                {page.intro}
              </p>
            )}

            {page.buttons.length > 0 && (
              <div className="mx-auto flex max-w-md flex-col items-stretch gap-4">
                {page.buttons.map((button, index) => (
                  <a
                    key={`${button.label}-${index}`}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ctaClass}
                  >
                    {button.label}
                    <ArrowRight />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
