import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { customProjects } from '../src/data/projects'

// Upsert ONE entry from customProjects into the ProjectEntry table by slug.
// The /projects page reads Postgres, not src/data/projects.ts, so a new
// custom entry is invisible until it is seeded. Usage:
//   npx tsx scripts/seed-custom-project.ts <slug>
async function main() {
  const slug = process.argv[2]
  if (!slug) throw new Error('usage: seed-custom-project.ts <slug>')

  const p = customProjects.find((c) => c.slug === slug)
  if (!p) throw new Error(`${slug} not found in customProjects`)

  const fields = {
    source: 'CUSTOM' as const,
    githubSlug: null,
    name: p.name,
    description: p.description,
    linkHref: p.link.href,
    linkLabel: p.link.label,
    logoType: p.logo.type,
    logoSrc: p.logo.src ?? null,
    logoIconName: p.logo.name ?? null,
    logoClassName: p.logo.className ?? null,
    timeframe: p.timeframe,
    tech: p.tech,
    badges: p.badges ?? [],
    featured: p.featured ?? false,
    priority: p.priority ?? 99,
    visibility: p.visibility ?? 'public',
    visible: true,
    githubUrl: p.github ?? null,
  }

  const row = await prisma.projectEntry.upsert({
    where: { slug: p.slug },
    update: fields,
    create: { slug: p.slug, ...fields },
  })

  console.log(`Upserted ${row.slug}: featured=${row.featured} priority=${row.priority} visible=${row.visible}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
