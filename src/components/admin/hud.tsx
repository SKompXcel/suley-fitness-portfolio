import type { ReactNode } from 'react'

// Shared class vocabulary for the admin operator console. The admin commits to
// the dark HUD surface only (design.md: dark is the designed-for surface), so
// every color here is explicit — no dark: variants, no host-theme dependence.

export const panelClass =
  'admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6'

export const tableWrapClass =
  'admin-hairline overflow-hidden rounded-2xl border border-ink-border/80 bg-ink-surface/60'

export const inputClass =
  'mt-1 w-full rounded-md border border-ink-border bg-ink-bg/70 px-3 py-2 text-sm text-ink-text placeholder:text-ink-muted/50'

export const labelClass =
  'block font-mono text-[11px] uppercase tracking-wider text-ink-muted'

export const thClass =
  'px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-muted'

export const btnPrimaryClass =
  'rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50'

export const btnGhostClass =
  'rounded-md border border-ink-border px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-50'

export const btnDangerClass =
  'rounded-md border border-red-400/30 px-3 py-1.5 font-mono text-xs text-red-400 transition hover:bg-red-400/10 disabled:opacity-50'

export const linkAccentClass = 'font-mono text-xs text-accent hover:underline'

export const errorClass =
  'rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300'

export const flashClass =
  'border-b border-ink-border/70 bg-accent/10 px-4 py-2 font-mono text-xs text-accent'

// Page header: mono path eyebrow + title + optional meta line + right actions.
export function AdminPageHeader({
  path,
  title,
  meta,
  actions,
}: {
  path: string
  title: string
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="font-mono text-xs text-accent">{path}</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">
          {title}
        </h1>
        {meta ? <p className="mt-1 font-mono text-xs text-ink-muted">{meta}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}
