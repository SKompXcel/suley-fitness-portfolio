import type { StaticImageData } from 'next/image'

import solstice from '@/images/showcase/solstice.png'
import applify from '@/images/showcase/applify.png'
import skompxcel from '@/images/showcase/skompxcel.png'
import macStudyCompanion from '@/images/showcase/mac-study-companion/04-lecture-notes-receipts.jpg'
import zakatTriage from '@/images/showcase/zakat-triage/agent-file.jpg'

// Map a project slug to its real captured product screenshot. Only the
// projects with real captures get a frame; everything else renders a HUD
// placeholder. No fabricated imagery.
const BY_SLUG: Record<string, StaticImageData> = {
  'skomp-studio': solstice,
  skompxcel,
  'mac-study-companion': macStudyCompanion,
  'zakat-eligibility-triage': zakatTriage,
}

// Projects with a dedicated page on this site. The card links to it as "file".
const DETAIL_BY_SLUG: Record<string, string> = {
  'zakat-eligibility-triage': '/projects/zakat-triage',
}

export function detailHref(slug: string): string | null {
  return DETAIL_BY_SLUG[slug.toLowerCase()] ?? null
}

const BY_NAME: Record<string, StaticImageData> = {
  'Applify AI': applify,
}

export function screenshotFor(
  slug: string,
  name: string
): StaticImageData | null {
  return BY_SLUG[slug.toLowerCase()] ?? BY_NAME[name] ?? null
}

// Projects that have a real, sourced architecture diagram on /architecture.
// Keyed loosely so DB/GitHub name or slug variants still match.
const DIAGRAM_SLUGS = new Set([
  'skomp-studio',
  'delta-hacks-12',
  'cas-735-podcasthub',
])
const DIAGRAM_NAMES = new Set(['Applify AI', 'PodcastHub', 'Mike Ross AI'])

export function diagramHref(slug: string, name: string): string | null {
  const has =
    DIAGRAM_SLUGS.has(slug.toLowerCase()) ||
    DIAGRAM_NAMES.has(name) ||
    /podcast|applify|skomp|solstice/i.test(`${slug} ${name}`)
  return has ? '/architecture' : null
}
