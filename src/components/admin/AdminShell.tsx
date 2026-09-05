'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/components/admin/SignOutButton'

// The operator-console shell for the whole admin area: a persistent left rail
// on desktop, a collapsing top bar on mobile. Rendered as a fixed overlay so
// the admin owns its full viewport (the public Header/Footer stay untouched
// underneath). Dark-only by design — every color explicit.

const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: '/admin', label: 'dashboard', exact: true },
  { href: '/admin/posts', label: 'posts' },
  { href: '/admin/projects', label: 'projects' },
  { href: '/admin/resume', label: 'resume' },
  { href: '/admin/media', label: 'media' },
  { href: '/admin/settings', label: 'settings' },
]

function isActive(pathname: string, item: (typeof NAV)[number]): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <ul className="space-y-0.5">
      {NAV.map((item) => {
        const active = isActive(pathname, item)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'flex items-center gap-2.5 border-l-2 px-5 py-2.5 font-mono text-sm transition',
                active
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-transparent text-ink-muted hover:text-accent'
              )}
            >
              <span
                aria-hidden
                className={clsx(
                  'h-1 w-1 rounded-full',
                  active ? 'bg-accent shadow-[0_0_6px_#5BC8FF]' : 'bg-ink-border'
                )}
              />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function ShellFooter({ email }: { email: string | null }) {
  return (
    <div className="space-y-3 border-t border-ink-border/70 px-5 py-4">
      {email ? (
        <p className="truncate font-mono text-[11px] text-ink-muted" title={email}>
          {email}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="font-mono text-xs text-accent hover:underline">
          view site →
        </Link>
        <SignOutButton />
      </div>
    </div>
  )
}

export function AdminShell({
  email,
  children,
}: {
  email: string | null
  children: ReactNode
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-ink-bg font-sans text-ink-text lg:flex-row"
      style={{ colorScheme: 'dark' }}
    >
      <div aria-hidden className="hud-grid pointer-events-none absolute inset-0" />

      {/* Desktop rail */}
      <aside className="relative hidden w-60 shrink-0 flex-col border-r border-ink-border/70 bg-ink-surface/40 lg:flex">
        <div className="border-b border-ink-border/70 px-5 py-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-accent/5 font-mono text-sm font-bold text-accent"
            >
              SK
            </span>
            <div>
              <div className="font-mono text-sm text-accent">~/admin</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                operator console
              </div>
            </div>
          </div>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto py-4">
          <NavLinks pathname={pathname} />
        </nav>
        <ShellFooter email={email} />
      </aside>

      {/* Mobile top bar */}
      <header className="relative border-b border-ink-border/70 bg-ink-surface/40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/40 bg-accent/5 font-mono text-xs font-bold text-accent"
            >
              SK
            </span>
            <span className="font-mono text-sm text-accent">~/admin</span>
          </div>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md border border-ink-border px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-accent/40 hover:text-accent"
          >
            {menuOpen ? 'close' : 'menu'}
          </button>
        </div>
        {menuOpen ? (
          <nav
            id="admin-mobile-nav"
            aria-label="Admin"
            className="border-t border-ink-border/70 pb-2 pt-2"
          >
            <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <ShellFooter email={email} />
          </nav>
        ) : null}
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
