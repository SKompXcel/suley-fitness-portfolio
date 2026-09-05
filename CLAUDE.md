# CLAUDE.md — suleyman.io

Public personal site. Next.js 16 App Router, Prisma on Neon, deployed on Vercel.
This is Suleyman's public face during live job searches: **truth discipline
outranks every other concern in this repo.**

## The three rules that prevent known incidents

1. **Numbers are counted, not remembered.** Any quantitative claim (test counts,
   model counts, route counts, automation counts, hardware specs) must come from
   running the count against the source system, dated in the commit message.
   The register in `docs/resume-pipeline.md` lists currently-vetted numbers and
   RETRACTED/BANNED claims — read it before touching any resume, cover letter,
   or page that states a fact. Never reintroduce a banned claim.
2. **The resume is split-brained by design — move both halves together.**
   `/resume` renders from Prisma (seeded by `scripts/seed-resume.ts`); the
   downloadable PDFs build from `public/resume*.tex`. An edit to one without
   the other made the live page contradict its own PDFs for weeks. Every resume
   change = edit tex AND seed → build PDFs (pdflatex ×2 each; pages must be
   1/2/1) → merge → `npm run db:seed-resume` against prod (env:
   `~/.config/agentic-os/env/suleyman-io.env`) → verify live.
3. **Merge what you truth.** The Aug 2026 truthing pass sat on an unmerged
   branch while the live site served retracted claims for 2.5 months. A
   correctness fix is not done until it is on main, deployed, reseeded if
   DB-backed, and verified on the live URL.

## Content sources per page (know which half you are editing)

- `/resume` → Prisma (seed-resume.ts) + `public/*.pdf` (tex)
- `/projects` → GitHub API + Prisma `ProjectEntry` rows + `src/data/projects.ts`
  overrides. **DB rows can shadow code fixes** — check both. Fields are
  `linkHref`/`linkLabel`/`githubUrl`.
- `/articles` → Prisma `Post` (career-engine ingests DRAFTs via
  `POST /api/admin/posts`, Bearer `BLOG_INGEST_TOKEN`; publishing is human-only)
- `/`, `/about`, `/architecture`, `/uses` → hardcoded arrays in the page/
  component files; homepage telemetry components read the `system.telemetry`
  SiteSetting row pushed by the home server (`POST /api/admin/telemetry`,
  same Bearer token; see lib/site_telemetry in suley-agentic-os)

## Design

`./design.md` is canonical (supersedes design-jarvis.md). Read it before ANY
UI change; run `/design-review` before a UI PR. Hard bans that bite: no
em-dashes in brand copy, no fake/illustrative telemetry (every number real or
honestly static — this audience opens devtools), no MHC internal system or
stakeholder names anywhere public, gold accent rationed, mono for data only.

## Process

- Branch + PR + CI green (`Type check + tests + build`) + squash merge. Never
  push main directly. Local gate: `npx tsc --noEmit && npx vitest run`.
- Commits and PRs carry NO AI attribution lines of any kind.
- TWO Vercel projects deploy this repo (`suleyman.io` and the legacy
  `suley-fitness-portfolio-fnv6`); both redeploy on main. Verify changes on
  https://www.suleyman.io, not on a project URL. (Retiring the legacy project
  is a pending owner decision.)
- LaTeX: `\resumeItem` macros must keep `{#1\vspace{-2pt}}` with NO space
  before `\vspace` (a space reintroduces a phantom-blank-line wrap bug).

## Docs map

- `docs/resume-pipeline.md` — the full resume workflow + the claims register
- `design.md` — the design contract
- `cover-letters/` — tailoring = edit the three `\newcommand` slots only
