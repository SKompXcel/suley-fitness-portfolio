'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  async function handlePasskeySignIn() {
    setError(null)
    setPasskeyLoading(true)

    try {
      const optionsRes = await fetch('/api/auth/passkey/options', { method: 'POST' })
      if (!optionsRes.ok) {
        setError('Could not start passkey sign-in — use your password below.')
        return
      }
      const optionsJSON = await optionsRes.json()

      let assertion
      try {
        assertion = await startAuthentication({ optionsJSON })
      } catch (err) {
        const name = (err as { name?: string })?.name
        setError(
          name === 'NotAllowedError'
            ? 'Passkey sign-in was cancelled.'
            : 'Passkey sign-in failed — use your password below.'
        )
        return
      }

      const result = await signIn('passkey', {
        response: JSON.stringify(assertion),
        redirect: false,
        callbackUrl,
      })

      if (!result || result.error || !result.ok) {
        const message = result?.error
        setError(
          message && message !== 'CredentialsSignin'
            ? message
            : 'Passkey sign-in failed — use your password below.'
        )
        return
      }

      router.replace(callbackUrl)
      router.refresh()
    } catch {
      setError('Network error — could not reach the server. Is the dev server running?')
    } finally {
      setPasskeyLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let result
    try {
      result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })
    } catch (err) {
      setLoading(false)
      setError('Network error — could not reach the server. Is the dev server running?')
      return
    }

    setLoading(false)

    if (!result) {
      setError('No response from the auth server. Check the dev terminal for errors.')
      return
    }

    if (result.error) {
      // NextAuth maps unknown errors to "CredentialsSignin" — replace with a readable message.
      if (result.error === 'CredentialsSignin') {
        setError('Login failed. Check the dev terminal for the [auth] log line to see why.')
      } else {
        setError(result.error)
      }
      return
    }

    if (!result.ok) {
      setError('Login did not succeed for an unknown reason. Check dev terminal.')
      return
    }

    router.replace(callbackUrl)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handlePasskeySignIn}
        disabled={passkeyLoading || loading}
        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
      >
        {passkeyLoading ? 'Waiting for passkey…' : 'Sign in with a passkey'}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">or use your password</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="mt-1 flex justify-end">
            <Link
              href="/admin/forgot"
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
