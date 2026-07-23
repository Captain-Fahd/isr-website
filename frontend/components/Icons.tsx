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

export function CommunityIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.2 5.9a3.2 3.2 0 0 1 0 6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 14.6a5.5 5.5 0 0 1 3.5 4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function FaithIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.4 3.6a8.6 8.6 0 1 0 4.2 14.6A7 7 0 0 1 15.4 3.6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.4 6.1l.85 1.72 1.9.28-1.37 1.34.32 1.89-1.7-.9-1.7.9.33-1.89-1.38-1.34 1.9-.28z"
        fill="currentColor"
      />
    </svg>
  )
}

export function BookIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 6.8C10.6 5.5 8.7 4.8 6.6 4.8H3.5v12.6h3.1c2.1 0 4 .7 5.4 2 1.4-1.3 3.3-2 5.4-2h3.1V4.8h-3.1c-2.1 0-4 .7-5.4 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6.8v12.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function GlobeIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.4 9.5h17.2M3.4 14.5h17.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="12" cy="12" rx="4.2" ry="8.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
