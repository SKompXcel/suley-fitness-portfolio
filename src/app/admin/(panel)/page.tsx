import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'
import { getSystemTelemetry } from '@/lib/systemTelemetry'
import { AdminTelemetryPanel } from '@/components/admin/AdminTelemetryPanel'
import { AdminPageHeader, btnPrimaryClass, btnGhostClass } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — suleyman.io',
  robots: { index: false, follow: false },
}

function StatTile({
  href,
  label,
  value,
  detail,
}: {
  href: string
  label: string
  value: number
  detail: string
}) {
  return (
    <Link
      href={href}
      className="admin-hairline group relative overflow-hidden rounded-2xl border border-ink-border/80 bg-ink-surface/60 px-5 py-4 transition hover:border-accent/40"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-accent/40" />
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </div>
      <div className="mt-2.5 font-mono text-3xl font-bold leading-none tracking-tight tabular-nums text-ink-text">
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] text-ink-muted">{detail}</div>
      <span className="mt-3 block font-mono text-xs text-accent opacity-70 transition group-hover:opacity-100">
        open →
      </span>
    </Link>
  )
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [
    postGroups,
    projectCount,
    mediaCount,
    passkeyCount,
    experienceCount,
    educationCount,
    skillCount,
    certCount,
    telemetry,
  ] = await Promise.all([
    prisma.post.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.projectEntry.count(),
    prisma.media.count(),
    prisma.adminPasskey.count(),
    prisma.resumeExperience.count(),
    prisma.resumeEducation.count(),
    prisma.resumeSkill.count(),
    prisma.resumeCertification.count(),
    getSystemTelemetry(),
  ])

  const postsByStatus: Record<string, number> = {}
  for (const g of postGroups) postsByStatus[g.status] = g._count._all
  const postCount = postGroups.reduce((sum, g) => sum + g._count._all, 0)
  const draftCount = postsByStatus.DRAFT ?? 0
  const publishedCount = postsByStatus.PUBLISHED ?? 0
  const resumeItemCount = experienceCount + educationCount + skillCount + certCount

  return (
    <div className="space-y-8">
      <AdminPageHeader
        path="~/admin"
        title="Operator overview"
        meta={session?.user?.email ? `signed in as ${session.user.email}` : undefined}
        actions={
          <>
            <Link href="/admin/posts/new" className={btnPrimaryClass}>
              + new post
            </Link>
            <Link href="/admin/media" className={btnGhostClass}>
              media
            </Link>
            <Link href="/admin/settings" className={btnGhostClass}>
              settings
            </Link>
          </>
        }
      />

      <section
        aria-label="Content counts"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatTile
          href="/admin/posts"
          label="Posts"
          value={postCount}
          detail={`${draftCount} draft · ${publishedCount} published`}
        />
        <StatTile href="/admin/projects" label="Projects" value={projectCount} detail="entries in DB" />
        <StatTile href="/admin/media" label="Media" value={mediaCount} detail="files in Blob" />
        <StatTile
          href="/admin/resume"
          label="Resume"
          value={resumeItemCount}
          detail="items across sections"
        />
        <StatTile
          href="/admin/settings"
          label="Passkeys"
          value={passkeyCount}
          detail="registered"
        />
      </section>

      <section aria-label="System telemetry">
        <AdminTelemetryPanel telemetry={telemetry} />
      </section>
    </div>
  )
}
