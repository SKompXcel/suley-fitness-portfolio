'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ResumeExperience } from '@prisma/client'
import { upsertExperience, deleteExperience } from '@/app/admin/resume/actions'

export function ExperienceForm({ initial }: { initial?: ResumeExperience }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    role: initial?.role ?? '',
    company: initial?.company ?? '',
    companyUrl: initial?.companyUrl ?? '',
    location: initial?.location ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    current: initial?.current ?? false,
    bullets: (initial?.bullets ?? ['']).join('\n'),
    tech: (initial?.tech ?? []).join(', '),
    order: initial?.order ?? 0,
    visible: initial?.visible ?? true,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const input = {
      role: form.role.trim(),
      company: form.company.trim(),
      companyUrl: form.companyUrl.trim() || null,
      location: form.location.trim() || null,
      startDate: form.startDate.trim(),
      endDate: form.current ? null : form.endDate.trim() || null,
      current: form.current,
      bullets: form.bullets.split('\n').map((s) => s.trim()).filter(Boolean),
      tech: form.tech.split(',').map((s) => s.trim()).filter(Boolean),
      order: Number(form.order) || 0,
      visible: form.visible,
    }
    startTransition(async () => {
      const res = await upsertExperience(input, initial?.id)
      if (res.ok) {
        router.push('/admin/resume')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  function handleDelete() {
    if (!initial) return
    if (!confirm(`Delete "${initial.role} — ${initial.company}"?`)) return
    startTransition(async () => {
      const res = await deleteExperience(initial.id)
      if (res.ok) {
        router.push('/admin/resume')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="admin-hairline space-y-5 rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
      {error && <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Role" required>
          <input required type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input" />
        </Field>
        <Field label="Company" required>
          <input required type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
        </Field>
        <Field label="Company URL">
          <input type="url" value={form.companyUrl} onChange={(e) => setForm({ ...form, companyUrl: e.target.value })} className="input" placeholder="https://…" />
        </Field>
        <Field label="Location">
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Toronto, ON" />
        </Field>
        <Field label="Start date" required>
          <input required type="text" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" placeholder="Feb 2025" />
        </Field>
        <Field label="End date">
          <input type="text" disabled={form.current} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" placeholder="Present or Jun 2024" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} />
        Current role (endDate ignored)
      </label>

      <Field label="Bullets (one per line)">
        <textarea rows={6} value={form.bullets} onChange={(e) => setForm({ ...form, bullets: e.target.value })} className="input font-mono text-xs" />
      </Field>

      <Field label="Tech (comma-separated)">
        <input type="text" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} className="input" placeholder="TypeScript, Next.js, Prisma" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Order (lower = higher)">
          <input type="number" min={0} max={999} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input" />
        </Field>
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
          Visible
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-ink-border/70 pt-4">
        {initial ? (
          <button type="button" onClick={handleDelete} disabled={pending} className="font-mono text-sm text-red-400 hover:underline disabled:opacity-50">
            Delete
          </button>
        ) : <span />}
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
