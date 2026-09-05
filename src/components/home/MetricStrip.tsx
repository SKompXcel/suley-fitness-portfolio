import clsx from 'clsx'

import type { TelemetrySnapshot } from '@/lib/systemTelemetry'

// The hero metric strip: one bordered 4-up mono strip (2x2 on narrow). Numbers
// are stated, not counted-up, rendered tabular-nums immediately. When a fresh
// telemetry snapshot exists, the automation and watcher counts render LIVE from
// it with an honest as-of marker; when it does not, the strip keeps its static
// values with no liveness claim. The commit and publish-policy metrics are
// true static facts either way.

type Metric = {
  value: string
  accent?: string
  label: string
  sub?: string
}

function utcHhMm(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function MetricStrip({
  telemetry,
}: {
  telemetry: TelemetrySnapshot | null
}) {
  const liveSub = telemetry
    ? `live · as of ${utcHhMm(telemetry.generatedAt)} utc`
    : undefined

  const metrics: Metric[] = [
    telemetry
      ? {
          value: String(telemetry.counts.enabledTimers),
          label: 'scheduled automations',
          sub: liveSub,
        }
      : { value: '70', label: 'scheduled automations' },
    telemetry
      ? {
          value: String(telemetry.counts.watchers),
          label: 'always-on watchers',
          sub: liveSub,
        }
      : { value: '3', accent: '+1', label: 'always-on watchers' },
    { value: '14k', accent: '+', label: 'autonomous commits' },
    { value: '100', accent: '%', label: 'human-gated publishes' },
  ]

  return (
    <div className="mt-9 grid grid-cols-2 overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-b from-ink-surface to-[#0A0E14] sm:grid-cols-4">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={clsx(
            'relative px-5 py-4',
            // hairline dividers between cells (neutral, low-alpha)
            i % 2 === 0 && 'border-r border-white/[0.06]',
            i < 2 && 'border-b border-white/[0.06] sm:border-b-0',
            i === 1 && 'sm:border-r',
            i === 2 && 'sm:border-r'
          )}
        >
          <div className="font-mono text-3xl font-bold tracking-tight tabular-nums text-accent">
            {m.value}
            {m.accent ? <span className="text-gold">{m.accent}</span> : null}
          </div>
          <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            {m.label}
          </div>
          {m.sub ? (
            <div className="mt-1 font-mono text-[9.5px] tracking-[0.04em] text-accent/80">
              {m.sub}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
