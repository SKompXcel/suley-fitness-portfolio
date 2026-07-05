import Image, { type StaticImageData } from 'next/image'

export type PhoneShot = {
  image: StaticImageData
  /** Alt text for the screenshot (real capture). */
  alt: string
  /** Mono caption rendered under the phone frame. */
  caption: string
}

// A strip of phone-shaped framed captures. Portrait screenshots sit inside a
// clean bordered device frame with the shared HUD hairline top-accent, matching
// the browser-chrome FramedVisual aesthetic on /projects. Presentational only,
// real captures in, no fabricated imagery.
function PhoneFrame({ shot }: { shot: PhoneShot }) {
  return (
    <figure className="flex flex-col">
      <div className="relative mx-auto w-full max-w-[240px] rounded-[2.1rem] border border-white/12 bg-black/60 p-2">
        {/* shared cyan hairline top-accent */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(91,200,255,0.35), transparent)',
          }}
        />
        {/* speaker / notch cue */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[10px] z-10 h-1 w-12 -translate-x-1/2 rounded-full bg-white/15"
        />
        <div className="relative aspect-[23/50] w-full overflow-hidden rounded-[1.6rem] bg-black/40">
          <Image
            src={shot.image}
            alt={shot.alt}
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 90vw"
            className="object-cover object-top"
            placeholder="blur"
          />
        </div>
      </div>
      <figcaption className="mx-auto mt-4 max-w-[240px] font-mono text-[11px] leading-relaxed text-ink-muted">
        {shot.caption}
      </figcaption>
    </figure>
  )
}

export function PhoneGallery({ shots }: { shots: PhoneShot[] }) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {shots.map((shot) => (
        <PhoneFrame key={shot.alt} shot={shot} />
      ))}
    </div>
  )
}
