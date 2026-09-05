import { NextResponse, type NextRequest } from 'next/server'
import { createHash } from 'node:crypto'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

const MIN_PASSWORD_LENGTH = 12
const BCRYPT_COST = 12 // matches scripts/seed-admin.ts
const GENERIC_TOKEN_ERROR = { ok: false, error: 'Invalid or expired reset link' }

// POST: finish the reset. The token arrives raw from the emailed link, is
// looked up by its sha256 hash, and is single-use — errors stay generic so
// the endpoint confirms nothing about which tokens exist.
export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const { token, password } = (payload ?? {}) as {
    token?: unknown
    password?: unknown
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    )
  }
  if (typeof token !== 'string' || !token) {
    return NextResponse.json(GENERIC_TOKEN_ERROR, { status: 400 })
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')

  try {
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    })
    if (!row || row.usedAt || row.expiresAt <= new Date()) {
      return NextResponse.json(GENERIC_TOKEN_ERROR, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST)

    // Burn the token BEFORE updating the password: a failure between the two
    // leaves the token dead and the password unchanged — the safe direction
    // (the user re-requests; the link can never be replayed).
    await prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    })
    await prisma.adminUser.update({
      where: { id: row.adminUserId },
      data: { passwordHash },
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Could not reset the password' },
      { status: 500 }
    )
  }
  return NextResponse.json({ ok: true })
}
