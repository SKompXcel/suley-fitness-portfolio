'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="rounded-md border border-ink-border px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-accent/40 hover:text-accent"
    >
      sign out
    </button>
  )
}
