import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// Belt-and-suspenders cap on the free-text fields the executor already
// truncates on its side; a runaway payload never bloats a row.
const MAX_TEXT = 2000

// Same Bearer auth as the sibling queue route and /api/admin/pending-emails.
function authorize(request: NextRequest): boolean {
  const expected = process.env.BLOG_INGEST_TOKEN
  if (!expected) return false
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return header.slice(prefix.length) === expected
}

function optionalText(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  return value.slice(0, MAX_TEXT)
}

// POST: the home server stamps a finished run. Only an executing row can
// complete (FSM: pending -> executing -> done | failed); done and failed are
// terminal — a failed intent is never blindly retried.
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

  const { id, status, resultUrl, resultNote, error } = (payload ?? {}) as {
    id?: unknown
    status?: unknown
    resultUrl?: unknown
    resultNote?: unknown
    error?: unknown
  }
  if (typeof id !== 'string' || !id || (status !== 'done' && status !== 'failed')) {
    return NextResponse.json(
      { ok: false, error: "id and status ('done'|'failed') are required" },
      { status: 400 }
    )
  }

  try {
    const result = await prisma.opsIntent.updateMany({
      where: { id, status: 'executing' },
      data: {
        status,
        finishedAt: new Date(),
        resultUrl: optionalText(resultUrl),
        resultNote: optionalText(resultNote),
        error: optionalText(error),
      },
    })
    if (result.count !== 1) {
      return NextResponse.json(
        { ok: false, error: 'intent is not executing' },
        { status: 409 }
      )
    }
    return NextResponse.json({ ok: true, completed: true })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Database error' },
      { status: 500 }
    )
  }
}
