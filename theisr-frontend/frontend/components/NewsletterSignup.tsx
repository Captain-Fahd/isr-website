'use client'

import { useState } from 'react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'
type NewsletterVariant = 'card' | 'footer'

interface NewsletterSignupProps {
  variant?: NewsletterVariant
  className?: string
  title?: string
  description?: string
}

const DEFAULT_TITLE = 'Stay Updated'
const DEFAULT_DESCRIPTION = 'Subscribe to get news about events and community updates.'

export default function NewsletterSignup({
  variant = 'card',
  className = '',
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      setFormState('error')
      return
    }

    setFormState('submitting')

    // Placeholder until a newsletter API endpoint is available.
    await new Promise((resolve) => setTimeout(resolve, 400))

    setFormState('success')
    setEmail('')
  }

  if (formState === 'success') {
    if (variant === 'footer') {
      return (
        <div className={className}>
          <p className="text-sm font-semibold text-white">You&apos;re subscribed!</p>
          <p className="mt-1 text-xs text-gray-300">We&apos;ll keep you posted on ISR events and updates.</p>
        </div>
      )
    }

    return (
      <div
        className={`rounded-lg bg-white p-5 text-center shadow-md ${className}`.trim()}
      >
        <p className="text-base font-bold text-isr-dark-red">You&apos;re subscribed!</p>
        <p className="mt-2 text-sm text-gray-700">
          We&apos;ll keep you posted on ISR events and community updates.
        </p>
        <button
          type="button"
          onClick={() => setFormState('idle')}
          className="mt-4 text-sm font-semibold text-isr-turquoise transition-colors hover:text-isr-bright-red"
        >
          Subscribe another email
        </button>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h4 className="mb-2 font-bold text-lg">{title}</h4>
        <p className="mb-4 text-sm text-gray-300">{description}</p>
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (formState === 'error') setFormState('idle')
            }}
            placeholder="Your email"
            aria-label="Email address for newsletter"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="w-full rounded-lg bg-isr-bright-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-isr-dark-red disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formState === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
          {formState === 'error' && (
            <p className="text-xs text-isr-yellow">{errorMessage}</p>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-white p-5 text-center shadow-md ${className}`.trim()}>
      <h3 className="mb-2 text-base font-bold text-isr-dark-red">{title}</h3>
      <p className="mb-4 text-sm text-gray-700">{description}</p>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex max-w-sm flex-col gap-2 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (formState === 'error') setFormState('idle')
          }}
          placeholder="Your email"
          aria-label="Email address for newsletter"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-isr-turquoise focus:outline-none"
        />
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="rounded-lg bg-isr-bright-red px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red disabled:cursor-not-allowed disabled:opacity-60"
        >
          {formState === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {formState === 'error' && (
        <p className="mt-3 text-sm text-isr-bright-red">{errorMessage}</p>
      )}
    </div>
  )
}
