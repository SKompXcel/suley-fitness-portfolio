import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sealChallenge } from '@/lib/webauthn'

const findUniqueMock = vi.fn()
const updateMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminPasskey: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}))

const verifyAuthenticationResponseMock = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  verifyAuthenticationResponse: (...args: unknown[]) => verifyAuthenticationResponseMock(...args),
}))

const PASSKEY_ROW = {
  id: 'pk-1',
  credentialId: 'cred-1',
  publicKey: 'AQIDBA', // base64url of [1, 2, 3, 4]
  counter: 5,
  transports: 'internal,hybrid',
  label: 'Test passkey',
  adminUserId: 'admin-1',
  adminUser: { id: 'admin-1', email: 'suleyman@skompxcel.com' },
}

const AUTH_RESPONSE = JSON.stringify({
  id: 'cred-1',
  rawId: 'cred-1',
  type: 'public-key',
  response: {},
  clientExtensionResults: {},
})

describe('verifyPasskeyLogin', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    delete process.env.WEBAUTHN_RP_ID
    delete process.env.WEBAUTHN_ORIGINS
  })

  it('rejects when the challenge cookie is missing and never touches the DB', async () => {
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')

    await expect(verifyPasskeyLogin(AUTH_RESPONSE, undefined)).rejects.toThrow(/challenge/i)
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it('rejects a tampered challenge cookie and never touches the DB', async () => {
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')
    const sealed = sealChallenge('real-challenge').replace('real', 'evil')

    await expect(verifyPasskeyLogin(AUTH_RESPONSE, sealed)).rejects.toThrow(/challenge/i)
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it('rejects malformed response JSON', async () => {
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')

    await expect(verifyPasskeyLogin('not-json', sealChallenge('c'))).rejects.toThrow(/malformed/i)
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it('rejects an unknown credentialId without calling the verifier', async () => {
    findUniqueMock.mockResolvedValue(null)
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')

    await expect(verifyPasskeyLogin(AUTH_RESPONSE, sealChallenge('c'))).rejects.toThrow(
      /not registered/i
    )
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { credentialId: 'cred-1' },
      include: { adminUser: true },
    })
    expect(verifyAuthenticationResponseMock).not.toHaveBeenCalled()
  })

  it('propagates a counter-replay rejection from the verifier and does not update the row', async () => {
    findUniqueMock.mockResolvedValue(PASSKEY_ROW)
    verifyAuthenticationResponseMock.mockRejectedValue(
      new Error('Response counter value 3 was lower than expected 5')
    )
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')

    await expect(verifyPasskeyLogin(AUTH_RESPONSE, sealChallenge('c'))).rejects.toThrow(/counter/)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('rejects when the verifier says not verified and does not update the row', async () => {
    findUniqueMock.mockResolvedValue(PASSKEY_ROW)
    verifyAuthenticationResponseMock.mockResolvedValue({ verified: false })
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')

    await expect(verifyPasskeyLogin(AUTH_RESPONSE, sealChallenge('c'))).rejects.toThrow(
      /verification failed/i
    )
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('verifies against the stored credential, updates counter + lastUsedAt, and returns the admin user shape', async () => {
    findUniqueMock.mockResolvedValue(PASSKEY_ROW)
    updateMock.mockResolvedValue({})
    verifyAuthenticationResponseMock.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 6 },
    })
    const { verifyPasskeyLogin } = await import('@/lib/passkeyLogin')

    const user = await verifyPasskeyLogin(AUTH_RESPONSE, sealChallenge('the-challenge'))

    expect(verifyAuthenticationResponseMock).toHaveBeenCalledTimes(1)
    const call = verifyAuthenticationResponseMock.mock.calls[0][0]
    expect(call.expectedChallenge).toBe('the-challenge')
    expect(call.expectedRPID).toBe('suleyman.io')
    expect(call.expectedOrigin).toEqual(['https://www.suleyman.io', 'https://suleyman.io'])
    expect(call.credential).toEqual({
      id: 'cred-1',
      publicKey: new Uint8Array([1, 2, 3, 4]),
      counter: 5,
      transports: ['internal', 'hybrid'],
    })

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 'pk-1' },
      data: { counter: 6, lastUsedAt: expect.any(Date) },
    })

    expect(user).toEqual({ id: 'admin-1', email: 'suleyman@skompxcel.com', name: 'Admin' })
  })
})
