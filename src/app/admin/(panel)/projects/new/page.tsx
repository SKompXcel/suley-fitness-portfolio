import Link from 'next/link'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const metadata = {
  title: 'New project — Admin',
  robots: { index: false, follow: false },
}

export default function NewProjectPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/admin/projects" className="font-mono text-xs text-accent hover:underline">
            ← back to projects
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-text sm:text-3xl">
            New project
          </h1>
        </div>
        <ProjectForm mode="create" />
      </div>
    </div>
  )
}
