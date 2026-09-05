import Link from 'next/link'
import { fetchGitHubRepos } from '@/lib/github'
import { getAllProjectEntriesForAdmin } from '@/lib/projects'
import { ProjectsTable } from '@/components/admin/ProjectsTable'
import { AdminPageHeader, btnPrimaryClass } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Projects — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminProjectsPage() {
  const [dbEntries, githubRepos] = await Promise.all([
    getAllProjectEntriesForAdmin(),
    fetchGitHubRepos({ limit: 80 }).catch(() => []),
  ])

  const dbByGithubSlug = new Map(
    dbEntries.filter((e) => e.githubSlug).map((e) => [e.githubSlug!.toLowerCase(), e])
  )

  // Rows: DB entries (GITHUB or CUSTOM) + GitHub repos not yet in DB
  const rows = [
    ...dbEntries.map((e) => ({
      kind: 'db' as const,
      entry: e,
      github: e.githubSlug ? githubRepos.find((r) => r.githubSlug.toLowerCase() === e.githubSlug!.toLowerCase()) : undefined,
    })),
    ...githubRepos
      .filter((r) => !dbByGithubSlug.has(r.githubSlug.toLowerCase()))
      .map((r) => ({ kind: 'github-only' as const, github: r })),
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        path="~/admin/projects"
        title="Projects"
        meta={`${dbEntries.length} in DB · ${githubRepos.length} live from GitHub`}
        actions={
          <Link href="/admin/projects/new" className={btnPrimaryClass}>
            + new custom project
          </Link>
        }
      />

      <ProjectsTable rows={rows as any} />
    </div>
  )
}
