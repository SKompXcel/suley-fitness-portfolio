import { NextResponse, type NextRequest } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'
import {
  getWebAuthnConfig,
  openChallenge,
  REGISTRATION_CHALLENGE_COOKIE,
} from '@/lib/webauthn'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

const MAX_LABEL_LENGTH = 100

// POST: finish passkey registration — verify the authenticator's attestation
// against the sealed challenge cookie issued by /register/options and persist
// the credential as an AdminPasskey row.
export async function POST(request: NextRequest) {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const challenge = openChallenge(request.cookies.get(REGISTRATION_CHALLENGE_COOKIE)?.value)
  if (!challenge) {
    return NextResponse.json(
      { ok: false, error: 'Registration challenge missing or expired — try again' },
      { status: 400 }
    )
  }

  let body: { response?: RegistrationResponseJSON; label?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }
  if (!body?.response) {
    return NextResponse.json({ ok: false, error: 'response field required' }, { status: 400 })
  }

  const { rpID, origins } = getWebAuthnConfig()
  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge,
      expectedOrigin: origins,
      expectedRPID: rpID,
      // Matches userVerification: 'preferred' in the issued options.
      requireUserVerification: false,
    })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Registration verification failed' },
      { status: 400 }
    )
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ ok: false, error: 'Registration not verified' }, { status: 400 })
  }

  const { credential } = verification.registrationInfo
  const label =
    typeof body.label === 'string' && body.label.trim()
      ? body.label.trim().slice(0, MAX_LABEL_LENGTH)
      : `Passkey ${new Date().toISOString().slice(0, 10)}`

  let passkey
  try {
    passkey = await prisma.adminPasskey.create({
      data: {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: credential.transports?.length ? credential.transports.join(',') : null,
        label,
        adminUserId: session.user.id,
      },
    })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    if (e?.code === 'P2002') {
      return NextResponse.json(
        { ok: false, error: 'This passkey is already registered' },
        { status: 409 }
      )
    }
    return NextResponse.json({ ok: false, error: e?.message ?? 'Database error' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true, id: passkey.id, label: passkey.label })
  // The challenge is one-time — clear it once consumed.
  res.cookies.set(REGISTRATION_CHALLENGE_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
