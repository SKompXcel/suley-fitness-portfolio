import { prisma } from '@/lib/prisma'
import { ResumeDocumentCard } from '@/components/admin/ResumeDocumentCard'
import { ResumePdfCard } from '@/components/admin/ResumePdfCard'
import { ResumeSectionCard } from '@/components/admin/ResumeSectionCard'
import { AdminPageHeader } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Resume — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminResumePage() {
  const [doc, experiences, educations, skills, certifications] = await Promise.all([
    prisma.resumeDocument.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', title: 'Resume' },
    }),
    prisma.resumeExperience.findMany({ orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.resumeEducation.findMany({ orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.resumeSkill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
    prisma.resumeCertification.findMany({ orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }] }),
  ])

  return (
    <div>
      <div className="mx-auto max-w-5xl space-y-6">
        <AdminPageHeader
          path="~/admin/resume"
          title="Resume"
          meta="structured resume shown on /resume · PDF upload for download"
        />

        <ResumeDocumentCard doc={doc as any} />
        <ResumePdfCard doc={doc as any} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ResumeSectionCard
            title="Experience"
            items={experiences.map((e) => ({ id: e.id, primary: e.role, secondary: e.company, visible: e.visible }))}
            newHref="/admin/resume/experience/new"
            baseHref="/admin/resume/experience"
          />
          <ResumeSectionCard
            title="Education"
            items={educations.map((e) => ({ id: e.id, primary: e.degree, secondary: e.school, visible: e.visible }))}
            newHref="/admin/resume/education/new"
            baseHref="/admin/resume/education"
          />
          <ResumeSectionCard
            title="Skills"
            items={skills.map((s) => ({ id: s.id, primary: s.name, secondary: s.category, visible: s.visible }))}
            newHref="/admin/resume/skills/new"
            baseHref="/admin/resume/skills"
          />
          <ResumeSectionCard
            title="Certifications"
            items={certifications.map((c) => ({ id: c.id, primary: c.name, secondary: c.issuer, visible: c.visible }))}
            newHref="/admin/resume/certifications/new"
            baseHref="/admin/resume/certifications"
          />
        </div>
      </div>
    </div>
  )
}
