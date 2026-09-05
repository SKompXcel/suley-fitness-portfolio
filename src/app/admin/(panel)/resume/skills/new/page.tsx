import Link from 'next/link'
import { SkillForm } from '@/components/admin/SkillForm'

export const metadata = { title: 'New skill — Admin', robots: { index: false, follow: false } }

export default function NewSkillPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">New skill</h1>
        </div>
        <SkillForm />
      </div>
    </div>
  )
}
