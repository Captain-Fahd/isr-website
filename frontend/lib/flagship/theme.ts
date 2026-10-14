import type { CSSProperties } from 'react'
import type { FlagshipEvent } from './types'

/** Banner-driven colour scheme, exposed as CSS variables for flagship UI. */
export function themeVars({ theme }: FlagshipEvent): CSSProperties {
  return {
    '--su-dark': theme.dark,
    '--su-on-dark': theme.onDark,
    '--su-light': theme.light,
    '--su-on-light': theme.onLight,
    '--su-primary': theme.primary,
    '--su-on-primary': theme.onPrimary,
    '--su-accent': theme.accent,
  } as CSSProperties
}
