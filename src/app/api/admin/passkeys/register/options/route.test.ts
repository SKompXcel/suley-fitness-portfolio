import { describe, it, expect, beforeEach, vi } from 'vitest'
import { openChallenge, REGISTRATION_CHALLENGE_COOKIE } from '@/lib/webauthn'

const requireAdminMock = vi.fn()

vi.mock('@/lib/adminGuard', () => ({
  requireAdmin: (...args: unknown[]) => requireAdminMock(...args),
}))

const findManyMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminPasskey: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}))

const generateRegistrationOptionsMock = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: (...args: unknown[]) => generateRegistrationOptionsMock(...args),
}))

const SESSION = { user: { id: 'admin-1', email: 'suleyman@skompxcel.com', isAdmin: true } }

describe('POST /api/admin/passkeys/register/options', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    delete process.env.WEBAUTHN_RP_ID
    delete process.env.WEBAUTHN_ORIGINS
  })

  it('rejects an unauthenticated request with 401 and does not read the DB', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { POST } = await import('./route')

    const res = await POST()

    expect(res.status).toBe(401)
    expect(findManyMock).not.toHaveBeenCalled()
    expect(generateRegistrationOptionsMock).not.toHaveBeenCalled()
  })

  it('generates options excluding existing credentials and sets the sealed challenge cookie', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    findManyMock.mockResolvedValue([
      { credentialId: 'cred-1', transports: 'internal,hybrid' },
      { credentialId: 'cred-2', transports: null },
    ])
    const options = { challenge: 'test-challenge', rp: { id: 'suleyman.io' } }
    generateRegistrationOptionsMock.mockResolvedValue(options)
    const { POST } = await import('./route')

    const res = await POST()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(options)

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { adminUserId: 'admin-1' } })
    )

    expect(generateRegistrationOptionsMock).toHaveBeenCalledTimes(1)
    const call = generateRegistrationOptionsMock.mock.calls[0][0]
    expect(call.rpID).toBe('suleyman.io')
    expect(call.userName).toBe('suleyman@skompxcel.com')
    expect(call.attestationType).toBe('none')
    expect(call.excludeCredentials).toEqual([
      { id: 'cred-1', transports: ['internal', 'hybrid'] },
      { id: 'cred-2', transports: undefined },
    ])
    expect(call.authenticatorSelection).toEqual({
      residentKey: 'preferred',
      userVerification: 'preferred',
    })

    const cookie = res.cookies.get(REGISTRATION_CHALLENGE_COOKIE)
    expect(cookie).toBeDefined()
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.sameSite).toBe('strict')
    expect(openChallenge(cookie?.value)).toBe('test-challenge')
  })
})
