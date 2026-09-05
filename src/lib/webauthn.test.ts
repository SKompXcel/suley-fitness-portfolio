import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getWebAuthnConfig,
  sealChallenge,
  openChallenge,
  challengeCookieOptions,
  CHALLENGE_TTL_MS,
} from '@/lib/webauthn'

const SECRET = 'test-nextauth-secret'

describe('getWebAuthnConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    delete process.env.WEBAUTHN_RP_ID
    delete process.env.WEBAUTHN_ORIGINS
  })

  it('defaults to the production rpID and both www/apex origins', () => {
    const config = getWebAuthnConfig()
    expect(config.rpID).toBe('suleyman.io')
    expect(config.origins).toEqual(['https://www.suleyman.io', 'https://suleyman.io'])
  })

  it('honors WEBAUTHN_RP_ID and comma-separated WEBAUTHN_ORIGINS overrides', () => {
    process.env.WEBAUTHN_RP_ID = 'example.com'
    process.env.WEBAUTHN_ORIGINS = 'https://a.example.com, https://example.com'
    const config = getWebAuthnConfig()
    expect(config.rpID).toBe('example.com')
    expect(config.origins).toEqual(['https://a.example.com', 'https://example.com'])
  })

  it('switches to localhost rpID and adds the localhost origin in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const config = getWebAuthnConfig()
    expect(config.rpID).toBe('localhost')
    expect(config.origins).toContain('http://localhost:3000')
  })
})

describe('sealChallenge / openChallenge', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = SECRET
  })

  it('round-trips a challenge', () => {
    const sealed = sealChallenge('some-challenge')
    expect(openChallenge(sealed)).toBe('some-challenge')
  })

  it('rejects a missing value', () => {
    expect(openChallenge(undefined)).toBeNull()
    expect(openChallenge('')).toBeNull()
  })

  it('rejects a tampered challenge', () => {
    const sealed = sealChallenge('some-challenge')
    const tampered = sealed.replace('some-challenge', 'evil-challenge')
    expect(openChallenge(tampered)).toBeNull()
  })

  it('rejects a tampered signature', () => {
    const sealed = sealChallenge('some-challenge')
    expect(openChallenge(sealed.slice(0, -2) + 'xx')).toBeNull()
  })

  it('rejects an expired challenge', () => {
    const now = Date.now()
    const sealed = sealChallenge('some-challenge', now)
    expect(openChallenge(sealed, now + CHALLENGE_TTL_MS + 1)).toBeNull()
    expect(openChallenge(sealed, now + CHALLENGE_TTL_MS - 1)).toBe('some-challenge')
  })

  it('rejects a malformed value', () => {
    expect(openChallenge('just-one-part')).toBeNull()
    expect(openChallenge('a.b.c.d')).toBeNull()
  })
})

describe('challengeCookieOptions', () => {
  it('is httpOnly, sameSite strict, and short-lived', () => {
    const opts = challengeCookieOptions()
    expect(opts.httpOnly).toBe(true)
    expect(opts.sameSite).toBe('strict')
    expect(opts.path).toBe('/')
    expect(opts.maxAge).toBe(CHALLENGE_TTL_MS / 1000)
  })
})
