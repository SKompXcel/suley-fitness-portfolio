import clsx from 'clsx'

import { ConductorFeed } from './ConductorFeed'
import type { TelemetrySnapshot } from '@/lib/systemTelemetry'

// The signature element: a live operator console for the agentic OS, woven into
// the top of the proof rail. The telemetry cards render REAL values from the
// snapshot pushed by the home server (health, heartbeat, unit and watcher
// counts); when no fresh snapshot exists the console says so honestly instead
// of rendering fabricated readouts.

type Card = {
  label: string
  value: string
  unit?: string
  accent?: 'gold' | 'green'
}

function relativeTime(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

function TelemetryCard({ t }: { t: Card }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/15 bg-white/[0.018] px-3.5 py-3">
      <span
        aria-hidden
        className={clsx(
          'absolute inset-y-0 left-0 w-[2px]',
          t.accent === 'gold' ? 'bg-gold/70' : 'bg-accent/50'
        )}
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        {t.label}
      </div>
      <div
        className={clsx(
          'mt-2.5 font-mono text-2xl font-bold leading-none tracking-tight tabular-nums',
          t.accent === 'gold' && 'text-gold',
          t.accent === 'green' && 'text-[#46E5A0]',
          !t.accent && 'text-ink-text'
        )}
      >
        {t.value}
        {t.unit ? (
          <span className="ml-1.5 text-xs font-medium text-ink-muted">
            {t.unit}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function OperatorConsole({
  telemetry,
}: {
  telemetry: TelemetrySnapshot | null
}) {
  const degraded = telemetry?.health.status === 'degraded'
  const cards: Card[] = telemetry
    ? [
        {
          label: 'Health',
          value: telemetry.health.status,
          accent: degraded ? 'gold' : 'green',
        },
        {
          label: 'Last heartbeat',
          value: relativeTime(telemetry.health.lastHeartbeat),
          accent: degraded ? undefined : 'gold',
        },
        {
          label: 'Units enabled',
          value: String(telemetry.counts.enabledUnits),
          unit: 'units',
        },
        {
          label: 'Watchers',
          value: String(telemetry.counts.watchers),
          unit: 'live',
        },
      ]
    : []

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-ink-surface to-[#0A0E14] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
      />
      {/* head bar */}
      <div className="flex items-center gap-2.5 border-b border-accent/15 bg-accent/[0.03] px-4 py-3">
        <span aria-hidden className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-gold" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#46E5A0]" />
        </span>
        <span className="font-mono text-[11.5px] tracking-[0.04em] text-ink-muted">
          <span className="font-semibold text-ink-text">agentic-os</span> /
          status
        </span>
        {telemetry ? (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px] text-accent">
            <span
              aria-hidden
              className="hud-pulse h-[6px] w-[6px] animate-online-pulse rounded-full bg-accent shadow-[0_0_8px_var(--hud-accent)]"
            />
            MONITORING
          </span>
        ) : (
          <span className="ml-auto font-mono text-[10.5px] text-ink-muted">
            LINK OFFLINE
          </span>
        )}
      </div>

      <div className="p-3.5">
        {telemetry ? (
          <div className="grid grid-cols-2 gap-2.5">
            {cards.map((t) => (
              <TelemetryCard key={t.label} t={t} />
            ))}
          </div>
        ) : (
          <div className="px-1 py-2 font-mono text-[11px] text-ink-muted">
            telemetry link offline
          </div>
        )}

        <ConductorFeed events={telemetry?.events ?? null} />

        <div className="mt-3 space-y-2 px-1">
          <p className="font-mono text-[10.5px] tracking-[0.03em] text-ink-muted">
            inspired by Karpathy&apos;s LLM-OS · compounding memory
          </p>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            A personal multi-agent operating system that compounds research,
            ops, and engineering. Deterministic fail-closed gates, sandboxed
            workers, and human-tapped publishes. Built on Claude.
          </p>
        </div>
      </div>
    </div>
  )
}
