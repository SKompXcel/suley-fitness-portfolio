'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { btnPrimaryClass } from '@/components/admin/hud'
import { OPS_KINDS } from '@/lib/opsIntents'

type OpsIntent = {
  id: string
  kind: string
  status: 'pending' | 'executing' | 'done' | 'failed'
  requestedAt: string
  startedAt: string | null
  finishedAt: string | null
  resultUrl: string | null
  resultNote: string | null
  error: string | null
}

const POLL_MS = 10_000

function isActive(intent: OpsIntent): boolean {
  return intent.status === 'pending' || intent.status === 'executing'
}

function stamp(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusLine({ intent }: { intent: OpsIntent | undefined }) {
  if (!intent) {
    return <p className="font-mono text-xs text-ink-muted">idle · never run</p>
  }

  if (intent.status === 'pending') {
    return (
      <p className="flex items-center gap-2 font-mono text-xs text-ink-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        queued {stamp(intent.requestedAt)} · awaiting the server&apos;s next tick
      </p>
    )
  }

  if (intent.status === 'executing') {
    return (
      <p className="flex items-center gap-2 font-mono text-xs text-accent">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        executing · started {stamp(intent.startedAt)}
      </p>
    )
  }

  if (intent.status === 'done') {
    return (
      <div className="space-y-1">
        <p className="flex items-center gap-2 font-mono text-xs text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          done {stamp(intent.finishedAt)}
          {intent.resultUrl ? (
            <a
              href={intent.resultUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2 hover:text-ink-text"
            >
              view PR →
            </a>
          ) : null}
        </p>
        {intent.resultNote ? (
          <p className="font-mono text-xs text-ink-muted">{intent.resultNote}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="flex items-center gap-2 font-mono text-xs text-gold">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        failed {stamp(intent.finishedAt)}
      </p>
      {intent.error ? (
        <p className="font-mono text-xs text-ink-muted">{intent.error}</p>
      ) : null}
    </div>
  )
}

export function OpsConsole() {
  const [intents, setIntents] = useState<OpsIntent[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [minting, setMinting] = useState<string | null>(null)
  const intentsRef = useRef<OpsIntent[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ops', { cache: 'no-store' })
      if (!res.ok) return
      const body = await res.json()
      if (body.ok) {
        intentsRef.current = body.intents
        setIntents(body.intents)
      }
    } catch {
      // transient fetch failure: the next poll retries
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (intentsRef.current.some(isActive)) load()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  async function run(kind: string) {
    setMinting(kind)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/ops', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(body?.error ?? `run request failed (HTTP ${res.status})`)
      }
    } catch {
      setMessage('run request failed; check the connection and try again')
    } finally {
      setMinting(null)
      await load()
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-md border border-gold/40 bg-gold-dim/40 px-3 py-2 font-mono text-xs text-gold">
          {message}
        </p>
      ) : null}

      {OPS_KINDS.map(({ kind, name, description }) => {
        // GET returns newest first, so find() is the latest intent per kind.
        const latest = intents.find((i) => i.kind === kind)
        const busy = minting === kind || (latest ? isActive(latest) : false)
        return (
          <div
            key={kind}
            className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-medium text-ink-text">{name}</h2>
                <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
              </div>
              <button onClick={() => run(kind)} disabled={busy} className={btnPrimaryClass}>
                {busy ? 'running' : 'run'}
              </button>
            </div>
            <div className="mt-4 border-t border-ink-border/70 pt-3">
              <StatusLine intent={latest} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
