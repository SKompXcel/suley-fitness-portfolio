import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ExperienceForm } from '@/components/admin/ExperienceForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit experience — Admin', robots: { index: false, follow: false } }

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.resumeExperience.findUnique({ where: { id } })
  if (!item) notFound()
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">
            {item.role} <span className="text-ink-muted">· {item.company}</span>
          </h1>
        </div>
        <ExperienceForm initial={item} />
      </div>
    </div>
  )
}
