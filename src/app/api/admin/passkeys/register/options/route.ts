import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'
import {
  getWebAuthnConfig,
  sealChallenge,
  challengeCookieOptions,
  REGISTRATION_CHALLENGE_COOKIE,
} from '@/lib/webauthn'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

// POST: start passkey registration for the signed-in admin. Returns
// PublicKeyCredentialCreationOptionsJSON for @simplewebauthn/browser's
// startRegistration() and seals the challenge into a one-time httpOnly cookie
// that /register/verify consumes.
export async function POST() {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.adminPasskey.findMany({
    where: { adminUserId: session.user.id },
    select: { credentialId: true, transports: true },
  })

  const { rpID, rpName } = getWebAuthnConfig()
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: session.user.email ?? 'admin',
    userID: new TextEncoder().encode(session.user.id),
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({
      id: c.credentialId,
      transports: c.transports ? c.transports.split(',') : undefined,
    })),
    // No authenticatorAttachment restriction: platform authenticators (Face ID,
    // Touch ID) and cross-platform providers (1Password) both qualify.
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
  })

  const res = NextResponse.json(options)
  res.cookies.set(REGISTRATION_CHALLENGE_COOKIE, sealChallenge(options.challenge), {
    ...challengeCookieOptions(),
  })
  return res
}
