'use client'

import { FormEvent, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ResumeDocument } from '@prisma/client'
import { uploadResumePdf, removeResumePdf } from '@/app/admin/resume/actions'

export function ResumePdfCard({ doc }: { doc: ResumeDocument }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = inputRef.current?.files?.[0]
    if (!file) return
    setError(null)
    const fd = new FormData()
    fd.set('file', file)
    startTransition(async () => {
      const res = await uploadResumePdf(fd)
      if (res.ok) {
        setFlash('PDF uploaded')
        router.refresh()
        if (inputRef.current) inputRef.current.value = ''
        setTimeout(() => setFlash(null), 2000)
      } else {
        setError(res.error)
      }
    })
  }

  function handleRemove() {
    if (!confirm('Remove the current PDF?')) return
    setError(null)
    startTransition(async () => {
      const res = await removeResumePdf()
      if (res.ok) {
        setFlash('PDF removed')
        router.refresh()
        setTimeout(() => setFlash(null), 2000)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="admin-hairline rounded-2xl border border-ink-border/80 bg-ink-surface/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-ink-text">Downloadable PDF</h2>
        {flash && <span className="font-mono text-xs text-accent">{flash}</span>}
      </div>
      {error && <p className="mb-3 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      {doc.pdfUrl ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink-border bg-ink-bg/60 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink-text">{doc.pdfFilename ?? 'resume.pdf'}</div>
            <div className="text-xs text-ink-muted">
              Uploaded {doc.pdfUploadedAt ? new Date(doc.pdfUploadedAt).toLocaleString() : 'recently'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent hover:underline">Open</a>
            <button onClick={handleRemove} disabled={pending} className="font-mono text-xs text-red-400 hover:underline disabled:opacity-50">Remove</button>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm text-ink-muted">No PDF uploaded. The /resume page will render the structured sections only.</p>
      )}

      <form onSubmit={handleUpload} className="flex items-center gap-3">
        <input ref={inputRef} type="file" accept="application/pdf" className="text-sm text-ink-muted" />
        <button type="submit" disabled={pending} className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50">
          {pending ? 'Uploading…' : doc.pdfUrl ? 'Replace PDF' : 'Upload PDF'}
        </button>
      </form>
      <p className="mt-2 text-xs text-ink-muted">Max 10 MB · PDF only</p>
    </div>
  )
}
