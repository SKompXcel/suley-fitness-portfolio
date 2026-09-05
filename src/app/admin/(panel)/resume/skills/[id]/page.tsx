import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SkillForm } from '@/components/admin/SkillForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit skill — Admin', robots: { index: false, follow: false } }

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.resumeSkill.findUnique({ where: { id } })
  if (!item) notFound()
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/resume" className="font-mono text-xs text-accent hover:underline">← back to resume</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">
            {item.name} <span className="text-ink-muted">· {item.category}</span>
          </h1>
        </div>
        <SkillForm initial={item} />
      </div>
    </div>
  )
}
