'use client'

import { useCallback, useEffect, useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'

type PasskeyRow = {
  id: string
  label: string
  createdAt: string
  lastUsedAt: string | null
  transports: string[]
}

function formatDate(iso: string | null): string {
  if (!iso) return 'never'
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function PasskeysCard() {
  const [passkeys, setPasskeys] = useState<PasskeyRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/passkeys')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPasskeys(data.passkeys)
    } catch {
      setError('Could not load passkeys.')
      setPasskeys([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd() {
    setError(null)
    const label = window.prompt('Name this passkey (e.g. "iPhone Face ID", "1Password"):', '')
    if (label === null) return

    setBusy(true)
    try {
      const optionsRes = await fetch('/api/admin/passkeys/register/options', { method: 'POST' })
      if (!optionsRes.ok) {
        setError('Could not start passkey registration.')
        return
      }
      const optionsJSON = await optionsRes.json()

      let registration
      try {
        registration = await startRegistration({ optionsJSON })
      } catch (err) {
        const name = (err as { name?: string })?.name
        if (name === 'InvalidStateError') {
          setError('This authenticator already has a passkey registered here.')
        } else if (name === 'NotAllowedError') {
          setError('Passkey registration was cancelled.')
        } else {
          setError('Passkey registration failed.')
        }
        return
      }

      const verifyRes = await fetch('/api/admin/passkeys/register/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ response: registration, label }),
      })
      const data = await verifyRes.json()
      if (!verifyRes.ok || !data.ok) {
        setError(data.error ?? 'Passkey registration failed.')
        return
      }

      setFlash('Passkey added')
      setTimeout(() => setFlash(null), 2000)
      await load()
    } catch {
      setError('Network error while registering the passkey.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(passkey: PasskeyRow) {
    setError(null)
    if (!window.confirm(`Delete the passkey "${passkey.label}"? You can always sign in with your password.`)) {
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/passkeys/${passkey.id}`, { method: 'DELETE' })
      if (!res.ok) {
        setError('Could not delete the passkey.')
        return
      }
      await load()
    } catch {
      setError('Network error while deleting the passkey.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Passkeys</h2>
        {flash && <span className="text-xs text-accent dark:text-accent">{flash}</span>}
      </div>
      <p className="mb-4 text-xs text-zinc-500">
        Sign in with Face ID, Touch ID, or a password manager like 1Password. Your password always keeps working as a fallback.
      </p>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

      {passkeys === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : passkeys.length === 0 ? (
        <p className="text-sm text-zinc-500">No passkeys registered yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{passkey.label}</p>
                <p className="text-xs text-zinc-500">
                  Added {formatDate(passkey.createdAt)} · Last used {formatDate(passkey.lastUsedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(passkey)}
                disabled={busy}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Add passkey'}
        </button>
      </div>
    </section>
  )
}
