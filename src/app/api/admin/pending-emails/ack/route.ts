import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

const MAX_ATTEMPTS = 3

// Same Bearer auth as the sibling drain route and /api/admin/telemetry.
function authorize(request: NextRequest): boolean {
  const expected = process.env.BLOG_INGEST_TOKEN
  if (!expected) return false
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return header.slice(prefix.length) === expected
}

// POST: the home server stamps a drained row. 'sent' is terminal; 'failed'
// increments attempts and keeps the row queued for a retry until the third
// failure parks it failed permanently.
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const { id, status } = (payload ?? {}) as { id?: unknown; status?: unknown }
  if (typeof id !== 'string' || !id || (status !== 'sent' && status !== 'failed')) {
    return NextResponse.json(
      { ok: false, error: "id and status ('sent'|'failed') are required" },
      { status: 400 }
    )
  }

  try {
    const row = await prisma.pendingEmail.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
    }

    if (status === 'sent') {
      await prisma.pendingEmail.update({
        where: { id },
        data: { status: 'sent', sentAt: new Date() },
      })
    } else {
      const attempts = row.attempts + 1
      await prisma.pendingEmail.update({
        where: { id },
        data: { attempts, status: attempts >= MAX_ATTEMPTS ? 'failed' : 'queued' },
      })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Database error' },
      { status: 500 }
    )
  }
}
