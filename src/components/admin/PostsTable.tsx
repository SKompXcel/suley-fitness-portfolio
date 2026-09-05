'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setPostStatus, deletePost } from '@/app/admin/posts/actions'
import { tableWrapClass, thClass, flashClass } from '@/components/admin/hud'

type Post = {
  id: string
  slug: string
  title: string
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  scheduledAt: string | null
  updatedAt: string
  tags: string[]
}

// HUD status pills: DRAFT carries the gold accent (work in progress, the
// payoff pending), PUBLISHED carries cyan (live/now), SCHEDULED a dimmed cyan,
// ARCHIVED muted.
const STATUS_STYLES: Record<Post['status'], { pill: string; dot: string }> = {
  DRAFT: { pill: 'border-gold/40 bg-gold/10 text-gold', dot: 'bg-gold' },
  SCHEDULED: { pill: 'border-accent/25 bg-accent/5 text-accent/80', dot: 'bg-accent/60' },
  PUBLISHED: { pill: 'border-accent/40 bg-accent/10 text-accent', dot: 'bg-accent' },
  ARCHIVED: { pill: 'border-ink-border bg-white/5 text-ink-muted', dot: 'bg-ink-muted' },
}

function StatusPill({ status }: { status: Post['status'] }) {
  const cfg = STATUS_STYLES[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        cfg.pill
      )}
    >
      <span aria-hidden className={clsx('h-1 w-1 rounded-full', cfg.dot)} />
      {status}
    </span>
  )
}

const FILTERS: ('ALL' | Post['status'])[] = ['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']

export function PostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<string | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL')

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: posts.length }
    for (const p of posts) c[p.status] = (c[p.status] ?? 0) + 1
    return c
  }, [posts])

  const visible = filter === 'ALL' ? posts : posts.filter((p) => p.status === filter)

  function run(promise: Promise<{ ok: boolean; error?: string }>, msg: string) {
    startTransition(async () => {
      const res = await promise
      setFlash(res.ok ? msg : `Error: ${res.error ?? 'unknown'}`)
      router.refresh()
      setTimeout(() => setFlash(null), 2500)
    })
  }

  return (
    <div className="space-y-3">
      {/* Status filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={clsx(
              'rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition',
              filter === f
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-ink-border text-ink-muted hover:border-accent/30 hover:text-accent'
            )}
          >
            {f.toLowerCase()} <span className="tabular-nums">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className={tableWrapClass}>
        {flash && <div className={flashClass}>{flash}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-border/50">
            <thead className="bg-ink-bg/60">
              <tr>
                <th className={thClass}>Title</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Published</th>
                <th className={thClass}>Updated</th>
                <th className={clsx(thClass, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/40">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center font-mono text-xs text-ink-muted">
                    no {filter === 'ALL' ? '' : `${filter.toLowerCase()} `}posts
                  </td>
                </tr>
              ) : (
                visible.map((p) => (
                  <tr key={p.id} className="transition hover:bg-accent/[0.03]">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink-text">{p.title || p.slug}</div>
                      <div className="font-mono text-xs text-ink-muted">/articles/{p.slug}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-ink-muted">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '·'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-ink-muted">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="space-x-2 px-3 py-2.5 text-right">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="font-mono text-xs text-accent hover:underline"
                      >
                        edit
                      </Link>
                      {p.status !== 'PUBLISHED' && (
                        <button
                          disabled={pending}
                          onClick={() => run(setPostStatus({ slug: p.slug, status: 'PUBLISHED' }), `${p.slug} published`)}
                          className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent transition hover:bg-accent/20 disabled:opacity-50"
                        >
                          publish
                        </button>
                      )}
                      {p.status === 'PUBLISHED' && (
                        <button
                          disabled={pending}
                          onClick={() => run(setPostStatus({ slug: p.slug, status: 'DRAFT' }), `${p.slug} unpublished`)}
                          className="rounded-md border border-gold/40 px-2 py-0.5 font-mono text-xs text-gold transition hover:bg-gold/10 disabled:opacity-50"
                        >
                          unpublish
                        </button>
                      )}
                      <button
                        disabled={pending}
                        onClick={() => {
                          if (confirm(`Delete "${p.title || p.slug}"?`)) {
                            run(deletePost(p.slug), `${p.slug} deleted`)
                          }
                        }}
                        className="font-mono text-xs text-red-400 hover:underline disabled:opacity-50"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
