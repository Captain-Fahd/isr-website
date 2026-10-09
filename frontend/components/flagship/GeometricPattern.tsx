/** Decorative eight-point-star tiling, drawn in `currentColor`. */
export default function GeometricPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="su-star" width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="16" y="16" width="32" height="32" />
            <rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)" />
            <circle cx="32" cy="32" r="6" />
            <path d="M0 0 L16 16 M64 0 L48 16 M0 64 L16 48 M64 64 L48 48" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#su-star)" />
    </svg>
  )
}
