import clsx from 'clsx'
import type { TelemetrySnapshot } from '@/lib/systemTelemetry'

// Compact operator-console readout for the admin dashboard. Same data contract
// as the homepage console: every value comes from the real snapshot pushed by
// the home server, and a missing/stale snapshot renders the honest offline
// state — never a fabricated number.

function relativeTime(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

function Readout({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'gold' | 'green'
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/15 bg-white/[0.018] px-3.5 py-3">
      <span
        aria-hidden
        className={clsx(
          'absolute inset-y-0 left-0 w-[2px]',
          accent === 'gold' ? 'bg-gold/70' : 'bg-accent/50'
        )}
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </div>
      <div
        className={clsx(
          'mt-2 font-mono text-xl font-bold leading-none tracking-tight tabular-nums',
          accent === 'gold' && 'text-gold',
          accent === 'green' && 'text-[#46E5A0]',
          !accent && 'text-ink-text'
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function AdminTelemetryPanel({ telemetry }: { telemetry: TelemetrySnapshot | null }) {
  const degraded = telemetry?.health.status === 'degraded'

  return (
    <div className="admin-hairline overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-ink-surface to-[#0A0E14]">
      <div className="flex items-center gap-2.5 border-b border-accent/15 bg-accent/[0.03] px-4 py-3">
        <span aria-hidden className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-gold" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#46E5A0]" />
        </span>
        <span className="font-mono text-[11.5px] tracking-[0.04em] text-ink-muted">
          <span className="font-semibold text-ink-text">agentic-os</span> / status
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
          <span className="ml-auto font-mono text-[10.5px] text-ink-muted">LINK OFFLINE</span>
        )}
      </div>

      <div className="p-3.5">
        {telemetry ? (
          <>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Readout
                label="Health"
                value={telemetry.health.status}
                accent={degraded ? 'gold' : 'green'}
              />
              <Readout
                label="Last heartbeat"
                value={relativeTime(telemetry.health.lastHeartbeat)}
              />
              <Readout label="Units enabled" value={String(telemetry.counts.enabledUnits)} />
              <Readout label="Watchers" value={String(telemetry.counts.watchers)} />
            </div>

            {telemetry.events.length > 0 ? (
              <ul className="mt-3 space-y-0.5">
                {telemetry.events.slice(0, 6).map((e, i) => (
                  <li
                    key={`${e.t}-${i}`}
                    className={clsx(
                      'flex items-baseline gap-2.5 rounded px-2 py-1 font-mono text-[11px]',
                      i % 2 === 0 && 'bg-white/[0.015]'
                    )}
                  >
                    <span
                      aria-hidden
                      className={clsx(
                        'inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-[1px]',
                        e.status === 'warn' ? 'bg-gold' : 'bg-accent'
                      )}
                    />
                    <span className="shrink-0 tabular-nums text-ink-muted">
                      {relativeTime(e.t)}
                    </span>
                    <span className="min-w-0 truncate text-ink-text/80">{e.label}</span>
                    <span className="ml-auto shrink-0 text-ink-muted">{e.kind}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="mt-3 px-1 font-mono text-[10.5px] text-ink-muted">
              snapshot pushed {relativeTime(telemetry.generatedAt)}
            </p>
          </>
        ) : (
          <p className="px-1 py-2 font-mono text-[11px] text-ink-muted">
            telemetry link offline · no fresh snapshot in the last 24h
          </p>
        )}
      </div>
    </div>
  )
}
