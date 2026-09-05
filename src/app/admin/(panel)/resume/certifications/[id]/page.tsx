import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CertificationForm } from '@/components/admin/CertificationForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit certification — Admin', robots: { index: false, follow: false } }

export default async function EditCertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.resumeCertification.findUnique({ where: { id } })
  if (!item) notFound()
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">
            {item.name} <span className="text-ink-muted">· {item.issuer}</span>
          </h1>
        </div>
        <CertificationForm initial={item} />
      </div>
    </div>
  )
}
