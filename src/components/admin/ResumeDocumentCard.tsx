'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ResumeDocument } from '@prisma/client'
import { updateResumeDocument } from '@/app/admin/resume/actions'

export function ResumeDocumentCard({ doc }: { doc: ResumeDocument }) {
  const router = useRouter()
  const [saving, startSaving] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: doc.title ?? 'Resume',
    subtitle: doc.subtitle ?? '',
    summary: doc.summary ?? '',
    location: doc.location ?? '',
    email: doc.email ?? '',
    phone: doc.phone ?? '',
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startSaving(async () => {
      const res = await updateResumeDocument(form)
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
    <form onSubmit={handleSubmit} className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-ink-text">Document</h2>
        {flash && <span className="font-mono text-xs text-accent">{flash}</span>}
      </div>

      {error && <p className="mb-3 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Input label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="Full-stack builder · Toronto, ON" />
        <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      </div>
      <div className="mt-3">
        <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Summary (shown at top of /resume)</label>
        <textarea
          rows={3}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="mt-1 w-full rounded-md border border-ink-border bg-ink-bg/70 px-3 py-2 text-sm text-ink-text placeholder:text-ink-muted/50"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save document'}
        </button>
      </div>
    </form>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-border bg-ink-bg/70 px-3 py-2 text-sm text-ink-text placeholder:text-ink-muted/50"
      />
    </div>
  )
}
