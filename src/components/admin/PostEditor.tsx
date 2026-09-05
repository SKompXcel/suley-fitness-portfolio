'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Post } from '@prisma/client'
import { createPost, updatePost } from '@/app/admin/posts/actions'
import { slugify } from '@/lib/postSchemas'

type Props = {
  initial?: Post
  mode: 'create' | 'edit'
}

export function PostEditor({ initial, mode }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    slug: initial?.slug ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    body: initial?.body ?? '# New post\n\n',
    coverImage: initial?.coverImage ?? '',
    author: initial?.author ?? 'Suleyman Kiani',
    tags: (initial?.tags ?? []).join(', '),
  })

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleCover(file: File) {
    setUploading(true)
    try {
      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })
      if (!res.ok) throw new Error(`upload failed: ${res.status}`)
      const { url } = (await res.json()) as { url: string }
      update('coverImage', url)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const input = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      body: form.body,
      coverImage: form.coverImage.trim() || null,
      author: form.author.trim() || 'Suleyman Kiani',
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    const res = mode === 'create' ? await createPost(input) : await updatePost(initial!.id, input)
    setSaving(false)

    if (!res.ok) {
      setError(res.error)
      return
    }

    router.push('/admin/posts')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <Field label="Title" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => {
              update('title', e.target.value)
              if (mode === 'create') update('slug', slugify(e.target.value))
            }}
            className="input"
          />
        </Field>
        <Field label="Slug" required>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="input"
            disabled={mode === 'edit'}
          />
        </Field>
      </div>

      <Field label="Description" required>
        <input
          type="text"
          required
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tags (comma-separated)">
          <input
            type="text"
            value={form.tags}
            onChange={(e) => update('tags', e.target.value)}
            placeholder="personal, growth"
            className="input"
          />
        </Field>
        <Field label="Cover image">
          <div className="flex gap-2">
            <input
              type="text"
              value={form.coverImage}
              onChange={(e) => update('coverImage', e.target.value)}
              placeholder="/images/cover.png or Blob URL"
              className="input flex-1"
            />
            <label className="cursor-pointer rounded-md border border-ink-border px-3 py-2 font-mono text-sm text-ink-muted transition hover:border-accent/40 hover:text-accent">
              {uploading ? 'Uploading…' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCover(e.target.files[0])}
              />
            </label>
          </div>
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Body (Markdown)</label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="font-mono text-xs text-accent hover:underline"
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
        {preview ? (
          <div className="prose prose-invert max-w-none rounded-md border border-ink-border bg-ink-surface/60 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            rows={20}
            value={form.body}
            onChange={(e) => update('body', e.target.value)}
            className="input font-mono text-sm"
            placeholder="# Your post title\n\nWrite markdown here. Supports GFM (tables, task lists, strikethrough)."
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-ink-border/70 pt-4">
        <span className="mr-auto font-mono text-[11px] text-ink-muted">
          saving never publishes · publish/unpublish from the posts list
        </span>
        <button type="button" onClick={() => router.back()} className="font-mono text-sm text-ink-muted hover:text-accent hover:underline">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50"
        >
          {saving ? 'saving…' : mode === 'create' ? 'create draft' : 'save changes'}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #1a2330;
          background: rgba(6, 8, 11, 0.7);
          color: #e8edf2;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input::placeholder {
          color: rgba(124, 136, 150, 0.5);
        }
        .input:focus {
          outline: none;
          border-color: rgb(91 200 255);
          box-shadow: 0 0 0 1px rgb(91 200 255);
        }
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
