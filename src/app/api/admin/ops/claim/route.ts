import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// Same Bearer auth as the sibling queue route and /api/admin/pending-emails.
function authorize(request: NextRequest): boolean {
  const expected = process.env.BLOG_INGEST_TOKEN
  if (!expected) return false
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return header.slice(prefix.length) === expected
}

// POST: atomic claim of one pending intent (the Dad OS operator-console FSM).
// The conditional updateMany is the atomicity: only a row still pending flips
// to executing, so a second claimer of the same id gets claimed:false instead
// of a double execution.
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

  const { id } = (payload ?? {}) as { id?: unknown }
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
  }

  try {
    const result = await prisma.opsIntent.updateMany({
      where: { id, status: 'pending' },
      data: { status: 'executing', startedAt: new Date() },
    })
    return NextResponse.json({ ok: true, claimed: result.count === 1 })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Database error' },
      { status: 500 }
    )
  }
}
