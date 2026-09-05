import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  telemetrySnapshotSchema,
  TELEMETRY_SETTING_KEY,
} from '@/lib/systemTelemetry'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// Bearer-token ingest used by the home server's telemetry pusher (server ->
// site over HTTP, so the pusher never holds the Neon DSN). Same token/env
// pattern as /api/admin/posts: the shared BLOG_INGEST_TOKEN env on both sides.
function authorize(request: NextRequest): boolean {
  const expected = process.env.BLOG_INGEST_TOKEN
  if (!expected) return false
  const header = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  return header.slice(prefix.length) === expected
}

// POST: validate and store one telemetry snapshot. The whole snapshot lives in
// a single SiteSetting row (key system.telemetry) as a JSON string — no schema
// migration, and each push replaces the last.
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

  const parsed = telemetrySnapshotSchema.safeParse(payload)
  if (!parsed.success) {
    const error = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    return NextResponse.json({ ok: false, error }, { status: 400 })
  }

  const value = JSON.stringify(parsed.data)
  try {
    await prisma.siteSetting.upsert({
      where: { key: TELEMETRY_SETTING_KEY },
      create: { key: TELEMETRY_SETTING_KEY, value },
      update: { value },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json({ ok: false, error: e?.message ?? 'Database error' }, { status: 500 })
  }
}

// GET (no auth): return the stored snapshot or 404. The snapshot holds only
// counts, generic event labels, and health state — nothing sensitive — and the
// homepage's client components read it from here.
export async function GET() {
  const row = await prisma.siteSetting.findUnique({
    where: { key: TELEMETRY_SETTING_KEY },
  })
  if (!row) {
    return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  }
  return NextResponse.json(JSON.parse(row.value))
}
