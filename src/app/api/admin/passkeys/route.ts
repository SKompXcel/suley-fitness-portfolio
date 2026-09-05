import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// GET: list the signed-in admin's registered passkeys for the settings UI.
export async function GET() {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.adminPasskey.findMany({
    where: { adminUserId: session.user.id },
    select: { id: true, label: true, createdAt: true, lastUsedAt: true, transports: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    ok: true,
    passkeys: rows.map((row) => ({
      id: row.id,
      label: row.label,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
      transports: row.transports ? row.transports.split(',') : [],
    })),
  })
}
