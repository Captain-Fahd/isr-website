'use client'

import { useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const BUSINESS_TYPES = [
  'Restaurant / Café',
  'Grocery / Retail',
  'Professional services',
  'Education / Tutoring',
  'Health / Medical',
  'Community organisation',
  'Other',
]

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-isr-turquoise focus:outline-none focus:ring-1 focus:ring-isr-turquoise'

export default function SponsorshipForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [message, setMessage] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('submitting')
    setErrorMessage('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/sponsorship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, businessType, businessName, message }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setFormState('success')
      setName('')
      setEmail('')
      setPhone('')
      setBusinessName('')
      setBusinessType('')
      setMessage('')
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
      setFormState('error')
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5 sm:p-8">
      {formState === 'success' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-isr-cream">
            <svg
              className="h-8 w-8 text-isr-turquoise"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-isr-dark-red">Enquiry Sent!</h3>
          <p className="mb-6 max-w-md text-gray-600">
            Jazakallah khayran for your interest in partnering with ISR. Our team will review your
            enquiry and get back to you soon, in sha Allah.
          </p>
          <button
            onClick={() => setFormState('idle')}
            className="min-h-11 rounded-lg bg-isr-turquoise px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
          >
            Send another enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sponsor-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Your name <span className="text-isr-bright-red">*</span>
              </label>
              <input
                id="sponsor-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="sponsor-email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email <span className="text-isr-bright-red">*</span>
              </label>
              <input
                id="sponsor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@business.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sponsor-phone"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Phone number <span className="text-isr-bright-red">*</span>
              </label>
              <input
                id="sponsor-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                placeholder="04XX XXX XXX"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="sponsor-business-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Business name <span className="text-isr-bright-red">*</span>
              </label>
              <input
                id="sponsor-business-name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                autoComplete="organization"
                placeholder="Your business or organisation"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sponsor-business-type"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Business type <span className="text-isr-bright-red">*</span>
            </label>
            <select
              id="sponsor-business-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
              className={`${inputClass} ${businessType ? '' : 'text-gray-400'}`}
            >
              <option value="" disabled>
                Select a business type
              </option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type} className="text-gray-900">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sponsor-message"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Message <span className="text-isr-bright-red">*</span>
            </label>
            <textarea
              id="sponsor-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Tell us a little about your business and how you would like to partner with ISR…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {formState === 'error' && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-isr-bright-red"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="min-h-11 w-full rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formState === 'submitting' ? 'Sending…' : 'Send Sponsorship Enquiry'}
          </button>

          <p className="text-center text-xs text-gray-500">
            We&apos;ll only use your details to respond to this enquiry.
          </p>
        </form>
      )}
    </div>
  )
}
