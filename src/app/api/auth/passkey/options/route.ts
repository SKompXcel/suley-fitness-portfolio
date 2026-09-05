import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import {
  getWebAuthnConfig,
  sealChallenge,
  challengeCookieOptions,
  AUTHENTICATION_CHALLENGE_COOKIE,
} from '@/lib/webauthn'

// POST (unauthenticated): start passkey sign-in. Empty allowCredentials makes
// this a discoverable-credential (usernameless) ceremony — the browser/1Password
// offers whatever passkeys it holds for this rpID. The challenge is sealed into
// a one-time httpOnly cookie that the NextAuth 'passkey' provider consumes.
export async function POST() {
  const { rpID } = getWebAuthnConfig()
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [],
    userVerification: 'preferred',
  })

  const res = NextResponse.json(options)
  res.cookies.set(AUTHENTICATION_CHALLENGE_COOKIE, sealChallenge(options.challenge), {
    ...challengeCookieOptions(),
  })
  return res
}
