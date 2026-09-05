import Link from 'next/link'
import { EducationForm } from '@/components/admin/EducationForm'

export const metadata = { title: 'New education — Admin', robots: { index: false, follow: false } }

export default function NewEducationPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">New education</h1>
        </div>
        <EducationForm />
      </div>
    </div>
  )
}
