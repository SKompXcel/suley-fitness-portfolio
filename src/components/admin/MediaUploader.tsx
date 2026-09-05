'use client'

import { useRef, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

// Drag-drop + file-picker uploads straight from the media library, through the
// existing /api/admin/upload route (image types only, 5 MB cap — enforced
// server-side; mirrored here for honest UI).

const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif'

export function MediaUploader() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return
    setUploading(true)
    setErrors([])
    const failed: string[] = []
    for (const file of files) {
      try {
        const res = await fetch(
          `/api/admin/upload?filename=${encodeURIComponent(file.name)}`,
          { method: 'POST', body: file }
        )
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null
          failed.push(`${file.name}: ${data?.error ?? `HTTP ${res.status}`}`)
        }
      } catch {
        failed.push(`${file.name}: network error`)
      }
    }
    setUploading(false)
    setErrors(failed)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          'admin-hairline rounded-2xl border border-dashed p-8 text-center transition',
          dragging
            ? 'border-accent/60 bg-accent/5'
            : 'border-ink-border bg-ink-surface/40'
        )}
      >
        <p className="font-mono text-sm text-ink-text">
          {uploading ? 'uploading…' : 'drop images here'}
        </p>
        <p className="mt-1 font-mono text-[11px] text-ink-muted">
          png · jpeg · webp · svg · gif · up to 5 MB each
        </p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent/20 disabled:opacity-50"
        >
          choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
        />
      </div>
      {errors.length > 0 ? (
        <ul className="mt-3 space-y-1 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2">
          {errors.map((err) => (
            <li key={err} className="font-mono text-xs text-red-300">
              {err}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
