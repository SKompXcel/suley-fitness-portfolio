import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// Bearer-token drain used by the home server's site-reset-mailer timer — the
// telemetry pattern in reverse (server pulls over HTTP, so the Neon DSN never
// leaves Vercel). Same token/env pattern as /api/admin/telemetry: the shared
// BLOG_INGEST_TOKEN env on both sides.
function authorize(request: NextRequest): boolean {
  const expected = process.env.BLOG_INGEST_TOKEN
  if (!expected) return false
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return header.slice(prefix.length) === expected
}

// GET: up to 10 queued outbound emails, oldest first. The home server sends
// each via its Workspace Gmail path and acks sent/failed on the sibling
// /api/admin/pending-emails/ack route.
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const emails = await prisma.pendingEmail.findMany({
      where: { status: 'queued' },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        id: true,
        toAddr: true,
        subject: true,
        body: true,
        attempts: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ ok: true, emails })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Database error' },
      { status: 500 }
    )
  }
}
