'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectEntry } from '@prisma/client'
import {
  toggleProjectField,
  setProjectPriority,
  upsertGithubOverride,
  deleteProject,
} from '@/app/admin/projects/actions'

type Row =
  | { kind: 'db'; entry: ProjectEntry; github?: { githubSlug: string; name: string; updatedAt: string } }
  | { kind: 'github-only'; github: { githubSlug: string; name: string; updatedAt: string; description: string } }

export function ProjectsTable({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<string | null>(null)

  function handle<T>(promise: Promise<{ ok: boolean; error?: string }>, successMsg: string) {
    startTransition(async () => {
      const res = await promise
      setFlash(res.ok ? successMsg : `Error: ${res.error ?? 'unknown'}`)
      router.refresh()
      setTimeout(() => setFlash(null), 2500)
    })
  }

  return (
    <div className="admin-hairline overflow-hidden rounded-2xl border border-ink-border/80 bg-ink-surface/60">
      {flash && (
        <div className="border-b border-ink-border/70 bg-accent/10 px-4 py-2 font-mono text-xs text-accent">
          {flash}
        </div>
      )}
      <table className="min-w-full divide-y divide-ink-border/50">
        <thead className="bg-ink-bg/60">
          <tr>
            <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-muted">Name</th>
            <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-muted">Source</th>
            <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-muted">Visible</th>
            <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-muted">Featured</th>
            <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-muted">Priority</th>
            <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-wider text-ink-muted">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-border/40">
          {rows.map((row) => {
            if (row.kind === 'github-only') {
              return (
                <tr key={row.github.githubSlug} className="bg-ink-bg/40">
                  <td className="px-3 py-2">
                    <div className="font-medium text-ink-text">{row.github.name}</div>
                    <div className="text-xs text-ink-muted">{row.github.githubSlug}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-ink-muted">GitHub (live, no override)</td>
                  <td className="px-3 py-2 text-xs text-ink-muted">auto</td>
                  <td className="px-3 py-2 text-xs text-ink-muted">·</td>
                  <td className="px-3 py-2 text-xs text-ink-muted">99</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      disabled={pending}
                      onClick={() =>
                        handle(upsertGithubOverride(row.github.githubSlug), `Override created for ${row.github.githubSlug}`)
                      }
                      className="font-mono text-xs text-accent hover:underline disabled:opacity-50"
                    >
                      + Create override
                    </button>
                  </td>
                </tr>
              )
            }

            const e = row.entry
            return (
              <tr key={e.id}>
                <td className="px-3 py-2">
                  <div className="font-medium text-ink-text">{e.name ?? row.github?.name ?? e.slug}</div>
                  <div className="text-xs text-ink-muted">{e.githubSlug ?? e.slug}</div>
                </td>
                <td className="px-3 py-2 text-sm text-ink-muted">
                  {e.source === 'GITHUB' ? 'GitHub + override' : 'Custom'}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={e.visible}
                    disabled={pending}
                    onChange={(ev) =>
                      handle(
                        toggleProjectField({ slug: e.slug, field: 'visible', value: ev.target.checked }),
                        `${e.slug} visible=${ev.target.checked}`
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={e.featured}
                    disabled={pending}
                    onChange={(ev) =>
                      handle(
                        toggleProjectField({ slug: e.slug, field: 'featured', value: ev.target.checked }),
                        `${e.slug} featured=${ev.target.checked}`
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    defaultValue={e.priority}
                    disabled={pending}
                    onBlur={(ev) => {
                      const priority = parseInt(ev.target.value, 10)
                      if (!Number.isNaN(priority) && priority !== e.priority) {
                        handle(setProjectPriority({ slug: e.slug, priority }), `${e.slug} priority=${priority}`)
                      }
                    }}
                    className="w-16 rounded border border-ink-border bg-ink-bg/70 px-2 py-1 text-sm text-ink-text"
                  />
                </td>
                <td className="px-3 py-2 text-right space-x-3">
                  <Link
                    href={`/admin/projects/${e.slug}`}
                    className="font-mono text-xs text-accent hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`Delete ${e.slug}?`)) {
                        handle(deleteProject(e.slug), `${e.slug} deleted`)
                      }
                    }}
                    className="font-mono text-xs text-red-400 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
