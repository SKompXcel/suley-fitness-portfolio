import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

const summary =
  'Software engineer who builds the tooling a finance desk actually runs on: a production quoting ' +
  'engine matching TValue, the industry lease-math standard, to the penny; a multi-tenant ' +
  'booking-and-payments platform processing real revenue; a self-hosted agentic platform ' +
  'with sandboxed workers and fail-closed gates. Equipment-finance experience at Mitsubishi HC Capital ' +
  'gives me domain fluency most engineers don’t have. MEng in Computing & Software ' +
  'at McMaster.'

const experiences = [
  {
    role: 'Associate Account Manager, Equipment Finance',
    company: 'Mitsubishi HC Capital Canada',
    companyUrl: 'https://www.mhccna.com/',
    location: 'Burlington, ON',
    startDate: 'Sept 2025',
    endDate: null,
    current: true,
    bullets: [
      'Replaced 13 abandoned Excel pricing calculators with one bilingual Next.js and TypeScript application spanning 14 dealer programs and 9 pricing engines; rate configurations are versioned Postgres rows, so repricing is a data change and never a deploy. Built solo alongside a full-time credit-operations role and on nobody\u2019s roadmap: in production since May 2026, cleared formal IT intake and a security review panel, and owned and run by corporate IT today.',
      'Certified it against the booking system of record by reconciling 40+ funded deals to the cent, reproducing every booked cash-flow vector and proving the NPV and IRR identities on the actual flows, not its own output. Gated every change behind a 1,396-test suite with mutation-tested assertions, 42 deal fixtures kept server-only, and expected-fail tests holding known gaps open; it caught 7 of 9 engines silently quoting wrong terms.',
      'Embedded with the national programs owner and turned tribal pricing knowledge into 16 written rulings that now supersede every spreadsheet, spanning capital and FMV leases, loans, residuals, and credit-tier cost-of-funds ladders.',
      'Designed the collections risk scorecard now in rollout to 25+ collectors, derived on six years of delinquency history: five bands separate default probability from 0.647 to 0.017, a 38x spread with no rank reversals. Re-scored a fresh 1,748-contract book into 1,023 ranked for action and 725 routed out across $66.4M of net investment, returning the band analysis and escalation shortlist the same evening it was asked for. Approved to launch in August 2026 with zero scoring parameters challenged.',
      'Built the AI document-validation service and the evaluation harness that measures it, cutting a 1 to 2 hour manual first pass to about a minute, advisory only and at zero incremental spend on data the company already held.',
      'Funded $50M in new business over the past year on the vendor-finance book I co-cover, clearing a $2M monthly quota every month since my second, on tickets from $100K to $1.5M. Structure and author the credit underwriting submissions that credit adjudicates: spread and analyze borrower financial statements for liquidity, leverage, fixed-charge coverage, working capital, and tangible net worth.',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Python', 'LLM extraction', 'Credit underwriting', 'TValue', 'Power BI'],
    order: 0,
  },
  {
    role: 'Software Engineer & Founder',
    company: 'SKomp Studio',
    companyUrl: 'https://www.solsticepilates.ca/',
    location: 'Remote',
    startDate: 'Jan 2024',
    endDate: null,
    current: true,
    bullets: [
      'Built Incite, a white-label multi-tenant booking-and-payments platform on a 59-model Prisma schema and 172 API routes: scheduling, FIFO waitlists and capacity gating, Square payments, recurring memberships with tax handling, digital waivers, ticketing, and per-tenant theming.',
      'Its flagship tenant, Solstice Pilates, runs its entire operation on it with no parallel manual system: $45K+ CAD processed since launch across 640 registered users, 1,380 confirmed bookings, and 105 active memberships.',
      'Treated money as the part that cannot be wrong: idempotent Square payment processing, webhook signature verification, and row-level tenant isolation through a scoped Prisma client enforced on every query path.',
      'Run it like a team would: 5,000+ automated tests gating every merge, Playwright suites as required status checks, Gitleaks secret scanning in CI, and branch-protected PRs with a Vercel preview deploy per change.',
      'Building SKomp Forge, an agentic iOS training coach, across 11 Swift 6 modules with 52 architecture decision records carrying the tradeoffs. Its agent exposes 18 tool schemas pinned in both Swift and Python and diff-tested so the two can never silently drift, and every write is a typed proposal the lifter confirms by tap. Full-duplex voice on gpt-realtime holds P90 313ms to first audio against a 1,500ms gate, with the phone never holding an API key.',
      'Coached 100+ learners through algorithms, systems design, and technical-interview prep, running every engagement end to end since 2024: acquisition, pricing, curriculum design, live sessions, and follow-up review.',
    ],
    tech: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL (Neon)', 'Square', 'Swift 6', 'SwiftUI', 'OpenAI Realtime'],
    order: 1,
  },
  {
    role: 'Junior Web Developer',
    company: 'Giftcash Inc.',
    companyUrl: null,
    location: 'Remote',
    startDate: 'May 2021',
    endDate: 'Jun 2022',
    current: false,
    bullets: [
      'Migrated a legacy Python/Django monolith to Node.js on AWS Lambda, trading always-on server overhead for per-request billing, and tuned PostgreSQL with indexing, caching, and query rewrites; that killed the sequential scans behind the gift-card lookup flow.',
      'Automated gift-card balance verification with a Puppeteer + Axios pipeline and stood up Jenkins and GitHub Actions CI/CD so merges deployed without manual release steps.',
    ],
    tech: ['Python', 'Node.js', 'AWS Lambda', 'PostgreSQL', 'Puppeteer', 'CI/CD'],
    order: 2,
  },
]

const educations = [
  {
    degree: 'Master of Engineering (MEng), Computing & Software',
    school: 'McMaster University',
    location: 'Hamilton, ON',
    startDate: 'Sept 2025',
    endDate: '2026',
    details:
      'Specialization across distributed systems, microservices, and applied ML/retrieval; A+ in Simple Type Theory and Microservices-Oriented Architectures. Research with Dr. Farmer and Dr. Paige on an LLM-based study companion that combines retrieval over course material with locally served models. Built PodcastHub for the distributed-systems course: five event-driven microservices across Node/Express and Python/FastAPI (six containers, with a dedicated FFmpeg worker), each a hexagonal bounded context, choreographed over a RabbitMQ topic exchange with MinIO object storage.',
    order: 0,
  },
  {
    degree: 'Bachelor of Applied Science (BASc), Honours Computer Science',
    school: 'McMaster University',
    location: 'Hamilton, ON',
    startDate: 'Sept 2018',
    endDate: 'Nov 2024',
    details: null,
    order: 1,
  },
]

const skillsByCategory: Record<string, string[]> = {
  Languages: ['TypeScript', 'Python', 'SQL', 'Java', 'C', 'Swift', 'JavaScript', 'Bash'],
  'Frameworks & Runtimes': ['Next.js', 'React', 'Node.js', 'FastAPI', 'Prisma', 'React Native', 'PyTorch'],
  'Data & Infrastructure': ['PostgreSQL (Neon)', 'MongoDB', 'AWS', 'GCP', 'Vercel', 'Docker', 'Redis'],
  'AI & Agentic': [
    'Claude API',
    'Multi-agent orchestration',
    'RAG & vector search',
    'Local LLMs (Ollama, qwen2.5)',
    'Whisper',
    'MCP',
  ],
  'Finance & Domain': [
    'Equipment & lease finance',
    'Amortization (PMT/PV/FV/RATE/IRR, TValue-validated)',
    'Subsidy & blended-rate modeling',
    'Credit-scorecard & recovery modeling',
    'Deal-funding workflows',
    'Power BI',
  ],
  Practices: ['TDD (Vitest, Playwright)', 'CI/CD', 'GitHub Actions', 'systemd automation'],
}

async function main() {
  await prisma.resumeDocument.upsert({
    where: { id: 'default' },
    update: {
      title: 'Resume',
      subtitle: 'Software Engineer · Fintech & Finance Platforms',
      summary,
      location: 'Burlington, ON',
      email: 'suley.kiani@outlook.com',
      phone: '+1 (289) 788-8260',
      pdfUrl: '/resume-1page.pdf',
      pdfFilename: 'Suleyman_Kiani_Resume.pdf',
    },
    create: {
      id: 'default',
      title: 'Resume',
      subtitle: 'Software Engineer · Fintech & Finance Platforms',
      summary,
      location: 'Burlington, ON',
      email: 'suley.kiani@outlook.com',
      phone: '+1 (289) 788-8260',
      pdfUrl: '/resume-1page.pdf',
      pdfFilename: 'Suleyman_Kiani_Resume.pdf',
    },
  })

  await prisma.resumeExperience.deleteMany({})
  for (const exp of experiences) {
    await prisma.resumeExperience.create({ data: { ...exp, visible: true } })
  }

  await prisma.resumeEducation.deleteMany({})
  for (const edu of educations) {
    await prisma.resumeEducation.create({ data: { ...edu, visible: true } })
  }

  await prisma.resumeSkill.deleteMany({})
  for (const [category, names] of Object.entries(skillsByCategory)) {
    for (let i = 0; i < names.length; i++) {
      await prisma.resumeSkill.create({
        data: { category, name: names[i], order: i, visible: true },
      })
    }
  }

  console.log(
    `Seeded resume: ${experiences.length} experiences, ${educations.length} education entries, ` +
      `${Object.values(skillsByCategory).flat().length} skills, 1 document.`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
