import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'
import { OPS_KIND_SET } from '@/lib/opsIntents'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// Admin-session console API for /admin/ops. Minting is the ONLY thing the
// site can do — execution happens on the home server, which drains pending
// intents over the Bearer-authed sibling queue/claim/complete routes and runs
// each kind via already-sanctioned machinery (the Dad OS operator-console
// pattern).

// GET: the last 20 intents, newest first, for the console's status cards.
export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const intents = await prisma.opsIntent.findMany({
      orderBy: { requestedAt: 'desc' },
      take: 20,
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

// POST: mint one pending intent for a kind from the closed set. One intent in
// flight per kind — a pending or executing sibling refuses the mint (409).
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const { kind } = (payload ?? {}) as { kind?: unknown }
  if (typeof kind !== 'string' || !OPS_KIND_SET.has(kind)) {
    return NextResponse.json(
      { ok: false, error: 'kind must be one of the known ops triggers' },
      { status: 400 }
    )
  }

  try {
    const inFlight = await prisma.opsIntent.findFirst({
      where: { kind, status: { in: ['pending', 'executing'] } },
      select: { id: true, status: true },
    })
    if (inFlight) {
      return NextResponse.json(
        { ok: false, error: `a ${inFlight.status} ${kind} run already exists` },
        { status: 409 }
      )
    }

    const intent = await prisma.opsIntent.create({ data: { kind } })
    return NextResponse.json({ ok: true, intent })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Database error' },
      { status: 500 }
    )
  }
}
