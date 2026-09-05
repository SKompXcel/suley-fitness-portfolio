import { describe, it, expect, beforeEach, vi } from 'vitest'
import { openChallenge, AUTHENTICATION_CHALLENGE_COOKIE } from '@/lib/webauthn'

const generateAuthenticationOptionsMock = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: (...args: unknown[]) => generateAuthenticationOptionsMock(...args),
}))

describe('POST /api/auth/passkey/options', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    delete process.env.WEBAUTHN_RP_ID
    delete process.env.WEBAUTHN_ORIGINS
  })

  it('generates discoverable-credential options and sets the sealed challenge cookie', async () => {
    const options = { challenge: 'auth-challenge', rpId: 'suleyman.io', allowCredentials: [] }
    generateAuthenticationOptionsMock.mockResolvedValue(options)
    const { POST } = await import('./route')

    const res = await POST()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(options)

    // Empty allowCredentials = usernameless/discoverable flow (Face ID, Touch ID, 1Password).
    expect(generateAuthenticationOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rpID: 'suleyman.io',
        allowCredentials: [],
        userVerification: 'preferred',
      })
    )

    const cookie = res.cookies.get(AUTHENTICATION_CHALLENGE_COOKIE)
    expect(cookie).toBeDefined()
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.sameSite).toBe('strict')
    expect(openChallenge(cookie?.value)).toBe('auth-challenge')
  })
})
