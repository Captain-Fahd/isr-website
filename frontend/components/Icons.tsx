export function MailIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 7l7 5 7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WhatsappIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5A8.5 8.5 0 0 0 4.1 15.1L3.5 20.5l5.4-.6A8.5 8.5 0 1 0 12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8.8c.2-.4.4-.5.7-.5h.7c.2 0 .4.1.5.4l.8 1.9c.1.2 0 .4-.1.6l-.4.5c-.1.1-.1.3 0 .5.3.6.9 1.4 1.8 2 .2.1.3.1.5 0l.7-.4c.2-.1.4-.1.6 0l1.8.8c.2.1.3.3.3.5v.7c0 .3-.1.5-.4.7-.4.2-.9.4-1.4.4-3.1 0-6.8-3.7-6.8-6.8 0-.5.1-1 .4-1.4z" fill="currentColor" />
    </svg>
  )
}

export function InstagramIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  )
}

export function LocationIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s7-4.5 7-10A7 7 0 1 0 5 11c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  )
}

export function ArrowRight({ className = 'w-4 h-4 inline-block ml-2' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 5l6 7-6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StarOrnament({ className = 'w-12 h-12 mx-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="10" fill="none" />
        <path d="M24 12v-6M24 42v-6M12 24h-6M42 24h-6M33.5 14.5l4.24-4.24M10.26 37.74l4.24-4.24M33.5 33.5l4.24 4.24M10.26 10.26l4.24 4.24" />
      </g>
    </svg>
  )
}

export function HandshakeIcon({ className = 'w-8 h-8 mx-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12l5 5 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 12l-5 5-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BookIcon({ className = 'w-8 h-8 mx-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GlobeIcon({ className = 'w-8 h-8 mx-auto' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h20M12 2v20M4.5 4.5c3 3 3 11 0 14.5M19.5 4.5c-3 3-3 11 0 14.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
