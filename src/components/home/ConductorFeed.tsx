'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import type { TelemetryEvent } from '@/lib/systemTelemetry'

// The conductor event stream — the signature live feed. Rows come from the
// real telemetry snapshot pushed by the home server (kinds automation and
// watcher); when no fresh snapshot exists the panel says so honestly instead
// of rendering fabricated rows. The motion only fades the already-laid-out
// rows in, one at a time, on mount; it never moves their layout box.

const DOT: Record<TelemetryEvent['status'], string> = {
  ok: 'bg-[#46E5A0] shadow-[0_0_8px_rgba(70,229,160,0.5)]',
  warn: 'bg-gold shadow-[0_0_8px_rgba(232,184,75,0.5)]',
}

function utcHhMm(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function ConductorFeed({
  events,
}: {
  events: TelemetryEvent[] | null
}) {
  const rows = events
    ? events.filter((e) => e.kind === 'automation' || e.kind === 'watcher')
    : null

  const [shown, setShown] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true)
      return
    }
    // One IO trigger; rows fade in via per-row transition-delay, never moving
    // their layout box.
    const el = ref.current
    if (!el) {
      setShown(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-accent/15 bg-black/25">
      <div className="flex items-center gap-2 border-b border-accent/15 px-3.5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          conductor · event stream
        </span>
        {rows ? (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-[#46E5A0]">
            <span
              aria-hidden
              className="hud-pulse h-[7px] w-[7px] animate-online-pulse rounded-full bg-[#46E5A0] shadow-[0_0_10px_#46E5A0]"
            />
            LIVE
          </span>
        ) : (
          <span className="ml-auto font-mono text-[10px] text-ink-muted">
            OFFLINE
          </span>
        )}
      </div>
      <div ref={ref} className="px-1 py-1.5">
        {rows ? (
          rows.map((row, i) => (
            <div
              key={`${row.t}-${i}`}
              data-shown={shown ? '' : undefined}
              style={{
                transitionDelay: shown ? `${i * 90}ms` : undefined,
              }}
              className={clsx(
                'grid grid-cols-[44px_14px_1fr] items-center gap-2.5 px-2.5 py-1.5 font-mono text-[11.5px]',
                'opacity-0 transition-opacity duration-300 ease-out data-[shown]:opacity-100',
                i % 2 === 1 && 'bg-white/[0.012]'
              )}
            >
              <span className="text-[10px] text-ink-muted">
                {utcHhMm(row.t)}
              </span>
              <span
                aria-hidden
                className={clsx('h-2 w-2 rounded-[2px]', DOT[row.status])}
              />
              <span className="text-ink-muted">{row.label}</span>
            </div>
          ))
        ) : (
          <div className="px-2.5 py-2 font-mono text-[11px] text-ink-muted">
            telemetry link offline
          </div>
        )}
      </div>
    </div>
  )
}
