import Image, { type StaticImageData } from 'next/image'
import { FiArrowUpRight } from 'react-icons/fi'

import { Container } from '@/components/Container'
import { Reveal } from '@/components/home/Reveal'
import { GitHubIcon } from '@/components/SocialIcons'
import { buildMeta } from '@/lib/buildMeta'
import agentFile from '@/images/showcase/zakat-triage/agent-file.jpg'
import refusal from '@/images/showcase/zakat-triage/refusal.jpg'
import n8nPipeline from '@/images/showcase/zakat-triage/n8n-pipeline.png'

export const metadata = buildMeta({
  title: 'Zakat-Eligibility Triage',
  description:
    'An AI triage agent for crowdfunding campaigns that does everything except decide. It assembles the evidence, cites the organizer at exact character offsets, refuses when the text cannot carry a determination, and hands the file to a qualified human reviewer.',
  path: '/projects/zakat-triage',
})

const LINKS = [
  {
    label: 'live · n8n fork',
    href: 'https://zakat-eligibility-triage-n8n.vercel.app',
    note: 'presenter cue cards on the homepage, node-by-node walkthrough at /design',
    kind: 'live',
  },
  {
    label: 'live · original',
    href: 'https://zakat-eligibility-triage.vercel.app',
    note: 'the button-driven version',
    kind: 'live',
  },
  {
    label: 'repo · original',
    href: 'https://github.com/kianis4/zakat-eligibility-triage',
    note: 'kianis4/zakat-eligibility-triage',
    kind: 'repo',
  },
  {
    label: 'repo · n8n fork',
    href: 'https://github.com/kianis4/zakat-eligibility-triage-n8n',
    note: 'kianis4/zakat-eligibility-triage-n8n',
    kind: 'repo',
  },
] as const

// Every number here is stated in the repos' own docs and test output. Nothing
// is estimated.
const LEDGER: { label: string; value: string }[] = [
  { label: 'model calls', value: '2, claude-sonnet-5, structured outputs' },
  { label: 'quotes', value: 'verbatim, byte-checked, with character offsets' },
  { label: 'refusal', value: 'deterministic, 4 rules' },
  { label: 'outcomes', value: 'human-only, enforced by Postgres CHECK constraints' },
  { label: 'precedent', value: 'pgvector, shown to reviewers only, never to the model' },
  { label: 'tests', value: '442' },
  { label: 'eval gate', value: '18 fixtures, 100% citation validity' },
  {
    label: 'n8n',
    value: '3 workflows: pipeline (webhook + hourly sweep), human-approval follow-up, error pager',
  },
]

const STACK = [
  'Next.js',
  'TypeScript',
  'Drizzle',
  'Postgres (Neon)',
  'pgvector',
  'Vercel AI SDK',
  'claude-sonnet-5',
  'n8n',
]

type Shot = {
  image: StaticImageData
  alt: string
  url: string
  caption: string
}

const SHOTS: Shot[] = [
  {
    image: agentFile,
    alt: 'Zakat-Eligibility Triage, the reviewer file for one campaign',
    url: 'zakat-eligibility-triage-n8n.vercel.app',
    caption:
      'The reviewer file. Every finding quotes the organizer in their own words at exact character offsets, and each quote is checked byte for byte against the campaign text before it is allowed into the file.',
  },
  {
    image: refusal,
    alt: 'Zakat-Eligibility Triage, a refusal',
    url: 'zakat-eligibility-triage-n8n.vercel.app',
    caption:
      'A refusal. When the text cannot carry a determination, four deterministic rules stop the pipeline and say which one fired. No model judgment is involved in that decision.',
  },
  {
    image: n8nPipeline,
    alt: 'The n8n canvas for the triage pipeline',
    url: 'n8n · pipeline workflow',
    caption:
      'The n8n canvas. A webhook and a scheduled sweep feed the pipeline, a second workflow chases the human approval, and a third pages me on error. n8n owns the clock and the megaphone, the code owns the rules. This capture predates two small changes: the sweep now runs hourly rather than every fifteen minutes, and the test count is 442.',
  },
]

function Eyebrow({ children }: { children: string }) {
  return <p className="mb-5 font-mono text-sm text-accent">{children}</p>
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-ink-border bg-ink-surface/40 px-2.5 py-1 font-mono text-xs text-ink-muted">
      {children}
    </span>
  )
}

// Browser-chrome frame, the same treatment the /projects featured cards use,
// but showing the full capture instead of a cropped cover.
function Frame({ shot }: { shot: Shot }) {
  return (
    <Reveal as="article">
      <figure>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="ml-2 truncate font-mono text-[10.5px] text-ink-muted">{shot.url}</span>
          </div>
          <Image
            src={shot.image}
            alt={shot.alt}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full"
            placeholder="blur"
          />
        </div>
        <figcaption className="mt-4 max-w-3xl font-mono text-[12px] leading-relaxed text-ink-muted">
          {shot.caption}
        </figcaption>
      </figure>
    </Reveal>
  )
}

export default function ZakatTriage() {
  return (
    <Container className="relative z-10 mt-16 sm:mt-24">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
          <div className="hud-grid absolute inset-0" />
          <div className="hud-glow absolute inset-0" />
        </div>
        <Eyebrow>~/projects/zakat-triage</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-normal tracking-tight text-ink-text sm:text-5xl">
          Zakat-Eligibility Triage
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          An AI triage agent for crowdfunding campaigns that does everything except decide.
        </p>
        <p className="mt-4 max-w-2xl text-base text-zinc-400">
          It reads a campaign, assembles the evidence a zakat determination turns on, quotes
          the organizer in their own words at exact character offsets, names what is missing
          or contested, refuses when the text cannot carry a determination, and hands the file
          to a qualified human reviewer. It never issues a ruling. I built it for
          LaunchGood&apos;s Applied AI Engineer process, August to September 2026.
        </p>

        <ul className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-lg border border-accent/20 bg-ink-surface/40 px-4 py-3 transition-colors hover:border-accent/40"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-text group-hover:text-accent">
                  {l.kind === 'repo' ? (
                    <GitHubIcon className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <FiArrowUpRight className="h-3.5 w-3.5" />
                  )}
                  {l.label}
                </span>
                <span className="mt-1 font-mono text-[11px] text-ink-muted">{l.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── What holds ───────────────────────────────────────────────────── */}
      <Reveal
        as="section"
        className="mt-10 rounded-xl border border-accent/30 bg-ink-surface/40 p-6 sm:p-8"
      >
        <Eyebrow>what holds</Eyebrow>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[max-content_1fr]">
          {LEDGER.map((row) => (
            <div key={row.label} className="contents">
              <dt className="font-mono text-xs uppercase tracking-wider text-ink-muted sm:py-1">
                {row.label}
              </dt>
              <dd className="font-mono text-sm text-ink-text sm:py-1">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          {STACK.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </Reveal>

      {/* ── The captures ─────────────────────────────────────────────────── */}
      <div className="mt-16 space-y-16">
        {SHOTS.map((shot) => (
          <Frame key={shot.alt} shot={shot} />
        ))}
      </div>

      {/* ── Why it never decides ─────────────────────────────────────────── */}
      <Reveal as="section" className="mt-16 pb-16">
        <Eyebrow>why it never decides</Eyebrow>
        <p className="max-w-3xl text-base text-zinc-300">
          I drew the line where the stakes are. A zakat determination is a religious ruling
          with money behind it, so the agent prepares the file and a qualified human signs
          it. Everything in the build serves that line. The quotes are checked byte for byte
          so a reviewer can trust what they read. The refusal is a rule table rather than a
          judgment call, so it fires the same way every time. The database will not store an
          outcome the model wrote. And the precedent search is shown to the reviewer, never
          fed back to the model, so the past informs the person and not the machine.
        </p>
      </Reveal>
    </Container>
  )
}
