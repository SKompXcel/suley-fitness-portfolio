import Link from 'next/link'
import { ExperienceForm } from '@/components/admin/ExperienceForm'

export const metadata = { title: 'New experience — Admin', robots: { index: false, follow: false } }

export default function NewExperiencePage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">New experience</h1>
        </div>
        <ExperienceForm />
      </div>
    </div>
  )
}
