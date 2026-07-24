'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MailIcon, WhatsappIcon, InstagramIcon, LocationIcon } from '@/components/Icons'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('submitting')
    setErrorMessage('')

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setFormState('success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setFormState('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
              Contact Us
            </p>
            <h1 className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl">
              Get In Touch
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              Have a question, want to get involved, or just want to say salam? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Info + Form */}
        <section className="px-4 pb-20">
          <div className="container-isr mx-auto max-w-5xl">
            <div className="grid gap-10 md:grid-cols-2">

              {/* Left — contact details */}
              <div className="space-y-8">
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-isr-dark-red">Contact Information</h2>
                  <div className="space-y-5">
                    <div className="flex gap-4 items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                        <MailIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Email</p>
                        <a href="mailto:isr@rmit.edu.au" className="text-sm text-isr-turquoise hover:text-isr-bright-red transition-colors">
                          isr@rmit.edu.au
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                        <WhatsappIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                        <a href="https://wa.me/61" className="text-sm text-isr-turquoise hover:text-isr-bright-red transition-colors">
                          Message us on WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                        <InstagramIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Instagram</p>
                        <a
                          href="https://www.instagram.com/islamicsocietyofrmit?igsh=enZoZnM0ZnVydHY="
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-isr-turquoise hover:text-isr-bright-red transition-colors"
                        >
                          @islamicsocietyofrmit
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                        <LocationIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Location</p>
                        <p className="text-sm text-gray-700">RMIT University, Melbourne</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — form */}
              <div className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5">
                {formState === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-isr-cream">
                      <svg className="h-8 w-8 text-isr-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-isr-dark-red">Message Sent!</h3>
                    <p className="mb-6 text-gray-600">
                      Jazakallah khayran for reaching out. We'll get back to you soon, in sha Allah.
                    </p>
                    <button
                      onClick={() => setFormState('idle')}
                      className="rounded-lg bg-isr-turquoise px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <h2 className="text-xl font-bold text-isr-dark-red">Send us a message</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                          Name <span className="text-isr-bright-red">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Your name"
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-isr-turquoise focus:outline-none focus:ring-1 focus:ring-isr-turquoise"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                          Email <span className="text-isr-bright-red">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-isr-turquoise focus:outline-none focus:ring-1 focus:ring-isr-turquoise"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Subject <span className="text-isr-bright-red">*</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder="What's this about?"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-isr-turquoise focus:outline-none focus:ring-1 focus:ring-isr-turquoise"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Message <span className="text-isr-bright-red">*</span>
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        placeholder="Write your message here..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-isr-turquoise focus:outline-none focus:ring-1 focus:ring-isr-turquoise"
                      />
                    </div>

                    {formState === 'error' && (
                      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-isr-bright-red">
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="w-full rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {formState === 'submitting' ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
