'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ResumeSkill } from '@prisma/client'
import { upsertSkill, deleteSkill } from '@/app/admin/resume/actions'

export function SkillForm({ initial }: { initial?: ResumeSkill }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    category: initial?.category ?? '',
    name: initial?.name ?? '',
    order: initial?.order ?? 0,
    visible: initial?.visible ?? true,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await upsertSkill({ ...form, order: Number(form.order) || 0 }, initial?.id)
      if (res.ok) { router.push('/admin/resume'); router.refresh() } else setError(res.error)
    })
  }

  function handleDelete() {
    if (!initial) return
    if (!confirm(`Delete "${initial.name}"?`)) return
    startTransition(async () => {
      const res = await deleteSkill(initial.id)
      if (res.ok) { router.push('/admin/resume'); router.refresh() } else setError(res.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="admin-hairline space-y-5 rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
      {error && <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <input required type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" placeholder="Languages / Cloud / AI" />
        </Field>
        <Field label="Name" required>
          <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="TypeScript" />
        </Field>
        <Field label="Order within category">
          <input type="number" min={0} max={999} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input" />
        </Field>
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
          Visible
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-ink-border/70 pt-4">
        {initial ? <button type="button" onClick={handleDelete} disabled={pending} className="font-mono text-sm text-red-400 hover:underline disabled:opacity-50">Delete</button> : <span />}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="font-mono text-sm text-ink-muted hover:text-accent hover:underline">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50">
            {pending ? 'Saving…' : initial ? 'Save' : 'Create'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input { width: 100%; border-radius: 0.375rem; border: 1px solid #1a2330; background: rgba(6, 8, 11, 0.7); color: #e8edf2; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        .input::placeholder { color: rgba(124, 136, 150, 0.5); }
        .input:focus { outline: none; border-color: rgb(91 200 255); box-shadow: 0 0 0 1px rgb(91 200 255); }
      `}</style>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
