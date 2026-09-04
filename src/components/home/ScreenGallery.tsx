import Image, { type StaticImageData } from 'next/image'

import { Reveal } from '@/components/home/Reveal'

export type Screen = {
  image: StaticImageData
  /** Mono label shown in the browser chrome, e.g. a route path. */
  url: string
  /** Short mono line under the frame, in plain student language. */
  caption: string
  alt: string
}

/**
 * Landscape product captures in a browser-chrome frame, mirroring the frame
 * FramedVisual uses on /projects. Presentational and static: no tilt, no
 * hover motion, nothing that could shift layout.
 *
 * One per row on purpose. These are full three-pane desktop captures, and in a
 * two-up grid they shrink to roughly a third of their native width, where the
 * sealed badges, withheld reasons and map labels the captions describe stop
 * being legible.
 *
 * Each figure carries its own Reveal rather than the section wrapping them all,
 * because Reveal needs 15% of its element inside the viewport and a stack of
 * six full-width captures is far too tall to ever reach that.
 */
export function ScreenGallery({ screens }: { screens: Screen[] }) {
  return (
    <div className="flex flex-col gap-8">
      {screens.map((s) => (
        <Reveal key={s.caption}>
          <figure>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="ml-2 truncate font-mono text-[10.5px] text-ink-muted">
                  {s.url}
                </span>
              </div>
              <div className="relative aspect-[1288/949] w-full bg-black/30">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover object-top"
                  placeholder="blur"
                />
              </div>
            </div>
            <figcaption className="mt-2.5 font-mono text-[11px] leading-relaxed text-ink-muted">
              {s.caption}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  )
}
