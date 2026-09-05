import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// Bearer-token drain used by the home server's site-ops-executor timer — the
// same pattern as /api/admin/pending-emails (server pulls over HTTP, so the
// Neon DSN never leaves Vercel). Same token/env pattern as /api/admin/telemetry:
// the shared BLOG_INGEST_TOKEN env on both sides.
function authorize(request: NextRequest): boolean {
  const expected = process.env.BLOG_INGEST_TOKEN
  if (!expected) return false
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return header.slice(prefix.length) === expected
}

// GET: up to 5 pending intents, oldest first. The home server claims each via
// the sibling /api/admin/ops/claim route before executing it.
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const intents = await prisma.opsIntent.findMany({
      where: { status: 'pending' },
      orderBy: { requestedAt: 'asc' },
      take: 5,
      select: {
        id: true,
        kind: true,
        requestedAt: true,
      },
    })
    return NextResponse.json({ ok: true, intents })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Database error' },
      { status: 500 }
    )
  }
}
