import { Children, Fragment, type ReactNode } from 'react'
import { PAGE_PATTERN, paginate } from './SpeakerCarousel'

/**
 * Speaker cards stacked in centred rows of 3, then 2, then 2 (the same grouping as
 * the carousel's pages), so every card stays the same width. One card per row on phones.
 * A row whose cards all have an audience (e.g. Brothers / Sisters) is captioned as
 * simultaneous sessions, with a faint divider between the cards.
 */
export default function SpeakerRows({
  children,
  audiences = [],
}: {
  children: ReactNode
  /** Each card's audience, in the same order as `children`. */
  audiences?: (string | undefined)[]
}) {
  const rows = paginate(
    Children.toArray(children).map((card, i) => ({ card, audience: audiences[i] })),
    PAGE_PATTERN,
  )

  return (
    <div className="space-y-6">
      {rows.map((row, i) => {
        const simultaneous = row.length > 1 && row.every((slot) => slot.audience)
        return (
          <div key={i} className={simultaneous ? 'pt-4' : undefined}>
            {simultaneous && (
              <p className="mb-4 flex items-center justify-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-(--su-dark) opacity-70">
                <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
                Simultaneous sessions
                <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
              </p>
            )}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
              {row.map((slot, j) => (
                <Fragment key={j}>
                  {simultaneous && j > 0 && (
                    <div
                      aria-hidden="true"
                      className="hidden w-px self-stretch bg-linear-to-b from-transparent via-(--su-dark)/30 to-transparent sm:block"
                    />
                  )}
                  <div className="w-full sm:w-[calc((100%-3rem)/3)]">{slot.card}</div>
                </Fragment>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
