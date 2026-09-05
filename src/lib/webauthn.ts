import { createHmac, timingSafeEqual } from 'node:crypto'

// WebAuthn relying-party config + the sealed one-time challenge cookie shared
// by the passkey registration and login flows.
//
// The challenge is issued by an options endpoint and must come back unchanged
// with the authenticator's response. It travels in an httpOnly, sameSite=strict,
// 5-minute cookie sealed with an HMAC over `<challenge>.<expiry>` (keyed by
// NEXTAUTH_SECRET) so the client can carry it but cannot mint or alter one.

export const REGISTRATION_CHALLENGE_COOKIE = 'webauthn-register-challenge'
export const AUTHENTICATION_CHALLENGE_COOKIE = 'webauthn-auth-challenge'
export const CHALLENGE_TTL_MS = 5 * 60 * 1000

const PRODUCTION_RP_ID = 'suleyman.io' // registrable domain — covers www + apex
const PRODUCTION_ORIGINS = ['https://www.suleyman.io', 'https://suleyman.io']

export function getWebAuthnConfig(): { rpID: string; rpName: string; origins: string[] } {
  const dev = process.env.NODE_ENV === 'development'

  const rpID = process.env.WEBAUTHN_RP_ID || (dev ? 'localhost' : PRODUCTION_RP_ID)

  const origins = process.env.WEBAUTHN_ORIGINS
    ? process.env.WEBAUTHN_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [...PRODUCTION_ORIGINS]

  if (dev && !origins.includes('http://localhost:3000')) {
    origins.push('http://localhost:3000')
  }

  return { rpID, rpName: 'suleyman.io admin', origins }
}

function challengeSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET must be set to seal WebAuthn challenges')
  }
  return secret
}

function sign(payload: string): string {
  return createHmac('sha256', challengeSecret()).update(payload).digest('base64url')
}

export function sealChallenge(challenge: string, now: number = Date.now()): string {
  const expires = now + CHALLENGE_TTL_MS
  const payload = `${challenge}.${expires}`
  return `${payload}.${sign(payload)}`
}

export function openChallenge(
  sealed: string | undefined | null,
  now: number = Date.now()
): string | null {
  if (!sealed) return null
  const parts = sealed.split('.')
  if (parts.length !== 3) return null
  const [challenge, expiresRaw, mac] = parts
  const expires = Number(expiresRaw)
  if (!challenge || !Number.isFinite(expires)) return null

  const expected = sign(`${challenge}.${expiresRaw}`)
  const macBuf = Buffer.from(mac)
  const expectedBuf = Buffer.from(expected)
  if (macBuf.length !== expectedBuf.length || !timingSafeEqual(macBuf, expectedBuf)) return null

  if (now > expires) return null
  return challenge
}

export function challengeCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: CHALLENGE_TTL_MS / 1000,
  }
}
