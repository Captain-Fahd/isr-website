import Image, { getImageProps } from 'next/image'
import type { FlagshipEvent } from '@/lib/flagship'

const backdropClass = 'absolute inset-0 -z-20 h-full w-full object-cover'

/**
 * Hero backdrop, swapped for its portrait version on phones when one exists.
 * A <picture> means each device downloads only the image it shows.
 */
export default function HeroBackdrop({ hero }: { hero: FlagshipEvent['theme']['hero'] }) {
  if (!hero.backdropMobile) {
    return <Image src={hero.backdrop} alt="" fill priority className="-z-20 object-cover" />
  }

  const common = { alt: '', priority: true, fill: true }
  const { props: desktop } = getImageProps({ ...common, src: hero.backdrop })
  const { props: mobile } = getImageProps({ ...common, src: hero.backdropMobile })
  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={desktop.srcSet ?? desktop.src} />
      {/* Bottom-anchored so the image's dark red base sits behind the countdown panel */}
      <img {...mobile} className={`${backdropClass} max-sm:object-bottom`} />
    </picture>
  )
}
