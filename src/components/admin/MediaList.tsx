'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Media = {
  id: string
  url: string
  pathname: string
  contentType: string
  size: number
  uploadedAt: string
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

// Typed tile for anything that is not a renderable image: a PDF, an unknown
// type, or a stored "image" whose bytes turn out to be junk (onError path).
// Never a broken <img> icon.
function TypedTile({ contentType, broken }: { contentType: string; broken?: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-2">
      <span className="rounded border border-ink-border bg-ink-bg/60 px-2 py-0.5 font-mono text-[10px] text-ink-muted">
        {contentType}
      </span>
      {broken ? (
        <span className="font-mono text-[10px] text-gold">unreadable file</span>
      ) : null}
    </div>
  )
}

export function MediaList({ media }: { media: Media[] }) {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(m: Media) {
    const name = m.pathname.split('/').pop() ?? m.pathname
    if (!window.confirm(`Delete "${name}"? This removes the blob and its record permanently.`)) {
      return
    }
    setError(null)
    setDeleting(m.id)
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: m.id }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(`${name}: ${data?.error ?? `HTTP ${res.status}`}`)
        return
      }
      router.refresh()
    } catch {
      setError(`${name}: network error`)
    } finally {
      setDeleting(null)
    }
  }

  if (media.length === 0) {
    return (
      <div className="admin-hairline rounded-2xl border border-dashed border-ink-border bg-ink-surface/40 p-12 text-center">
        <p className="font-mono text-sm text-ink-muted">no uploads yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 font-mono text-xs text-red-300">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((m) => {
          const isRenderableImage = m.contentType.startsWith('image/') && !broken[m.id]
          return (
            <div
              key={m.id}
              className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-3"
            >
              <div className="relative aspect-square overflow-hidden rounded-md border border-ink-border/50 bg-ink-bg/70">
                {isRenderableImage ? (
                  <Image
                    src={m.url}
                    alt={m.pathname}
                    fill
                    className="object-contain"
                    unoptimized
                    onError={() => setBroken((b) => ({ ...b, [m.id]: true }))}
                  />
                ) : (
                  <TypedTile contentType={m.contentType} broken={broken[m.id]} />
                )}
              </div>
              <div
                className="mt-2 truncate font-mono text-xs text-ink-text"
                title={m.pathname}
              >
                {m.pathname.split('/').pop()}
              </div>
              <div className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-muted">
                {formatBytes(m.size)} · {new Date(m.uploadedAt).toLocaleDateString()}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(m.url)
                    setCopied(m.id)
                    setTimeout(() => setCopied(null), 1500)
                  }}
                  className="flex-1 rounded-md border border-ink-border px-2 py-1 font-mono text-[11px] text-ink-muted transition hover:border-accent/40 hover:text-accent"
                >
                  {copied === m.id ? 'copied' : 'copy url'}
                </button>
                <button
                  disabled={deleting === m.id}
                  onClick={() => handleDelete(m)}
                  className="rounded-md border border-red-400/30 px-2 py-1 font-mono text-[11px] text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                >
                  {deleting === m.id ? '…' : 'delete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
