'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSettings } from '@/app/admin/settings/actions'
import type { SettingsMap } from '@/lib/siteSettings'

const HERO_FIELDS: { key: keyof SettingsMap; label: string; placeholder?: string; multiline?: boolean }[] = [
  { key: 'hero.headline', label: 'Headline', placeholder: 'Suleyman Kiani' },
  { key: 'hero.subtitle', label: 'Subtitle', placeholder: 'Full-stack builder · Toronto, ON', multiline: true },
  { key: 'hero.currentlyWorking', label: 'Currently working on', placeholder: 'Shipping Applify AI v2 + Skomp Studio client launches' },
  { key: 'hero.ctaLabel', label: 'CTA button label', placeholder: 'Get in touch' },
  { key: 'hero.ctaHref', label: 'CTA link', placeholder: 'mailto:you@example.com' },
]

const SOCIAL_FIELDS: { key: keyof SettingsMap; label: string; placeholder: string }[] = [
  { key: 'social.github', label: 'GitHub', placeholder: 'https://github.com/…' },
  { key: 'social.linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/…' },
  { key: 'social.x', label: 'X / Twitter', placeholder: 'https://x.com/…' },
  { key: 'social.instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { key: 'social.email', label: 'Email', placeholder: 'mailto:you@example.com' },
]

export function SettingsForm({ initial }: { initial: SettingsMap }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {}
    for (const f of [...HERO_FIELDS, ...SOCIAL_FIELDS]) {
      obj[f.key] = initial[f.key] ?? ''
    }
    return obj
  })

  function update(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await updateSettings(values)
      if (res.ok) {
        setFlash('Saved')
        router.refresh()
        setTimeout(() => setFlash(null), 2000)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <section className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-ink-text">Homepage hero</h2>
          {flash && <span className="font-mono text-xs text-accent">{flash}</span>}
        </div>
        <div className="space-y-4">
          {HERO_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">{f.label}</label>
              {f.multiline ? (
                <textarea
                  rows={2}
                  value={values[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => update(f.key as string, e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink-border bg-ink-bg/70 px-3 py-2 text-sm text-ink-text placeholder:text-ink-muted/50"
                />
              ) : (
                <input
                  type="text"
                  value={values[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => update(f.key as string, e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink-border bg-ink-bg/70 px-3 py-2 text-sm text-ink-text placeholder:text-ink-muted/50"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
        <h2 className="mb-4 text-lg font-medium text-ink-text">Social links</h2>
        <p className="mb-4 text-xs text-ink-muted">Leave blank to hide. These replace the hardcoded links in the header/footer.</p>
        <div className="space-y-4">
          {SOCIAL_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">{f.label}</label>
              <input
                type="text"
                value={values[f.key] ?? ''}
                placeholder={f.placeholder}
                onChange={(e) => update(f.key as string, e.target.value)}
                className="mt-1 w-full rounded-md border border-ink-border bg-ink-bg/70 px-3 py-2 text-sm text-ink-text placeholder:text-ink-muted/50"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="rounded-md border border-accent/40 bg-accent/10 px-6 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50">
          {pending ? 'Saving…' : 'Save all settings'}
        </button>
      </div>
    </form>
  )
}
