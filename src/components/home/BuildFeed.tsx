import type { TelemetrySnapshot } from '@/lib/systemTelemetry'

// Terminal-styled recent-heartbeat card. Lines come from the real telemetry
// snapshot pushed by the home server (kind build), framed as a log tail and
// closing on the true publish-policy line; when no fresh snapshot exists the
// panel says so honestly instead of rendering fabricated lines.

function utcHhMm(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function Glyph({ status }: { status: 'ok' | 'warn' }) {
  if (status === 'ok') return <span className="text-[#46E5A0]">✓</span>
  return <span className="text-gold">▶</span>
}

export function BuildFeed({
  telemetry,
}: {
  telemetry: TelemetrySnapshot | null
}) {
  const rows = telemetry
    ? telemetry.events.filter((e) => e.kind === 'build')
    : null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-b from-ink-surface to-[#0A0E14]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
      />
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
        <div className="font-mono text-xs uppercase tracking-[0.05em] text-ink-muted">
          // build feed{' '}
          {telemetry ? <span className="text-accent">·live</span> : null}
        </div>
        {telemetry ? (
          <div className="rounded-md border border-gold/20 bg-gold/[0.08] px-2 py-1 font-mono text-[10.5px] tracking-[0.04em] text-gold">
            as of {utcHhMm(telemetry.generatedAt)} utc
          </div>
        ) : (
          <div className="font-mono text-[10.5px] text-ink-muted">offline</div>
        )}
      </div>
      <div className="px-5 py-4 font-mono text-[12.5px] leading-[1.85]">
        {rows ? (
          <>
            {rows.map((row, i) => (
              <div key={`${row.t}-${i}`} className="text-ink-muted">
                <Glyph status={row.status} /> {row.label}{' '}
                <span className="text-ink-muted/60">{utcHhMm(row.t)}</span>
              </div>
            ))}
            <div className="text-ink-muted">
              <span className="text-ink-muted">·</span> all gates fail-closed ·
              publishes human-tapped
            </div>
          </>
        ) : (
          <div className="text-ink-muted">telemetry link offline</div>
        )}
      </div>
    </div>
  )
}
