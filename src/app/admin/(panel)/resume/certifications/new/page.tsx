import Link from 'next/link'
import { CertificationForm } from '@/components/admin/CertificationForm'

export const metadata = { title: 'New certification — Admin', robots: { index: false, follow: false } }

export default function NewCertPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">New certification</h1>
        </div>
        <CertificationForm />
      </div>
    </div>
  )
}
