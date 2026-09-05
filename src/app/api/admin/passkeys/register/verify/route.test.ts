import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { sealChallenge, REGISTRATION_CHALLENGE_COOKIE } from '@/lib/webauthn'

const requireAdminMock = vi.fn()

vi.mock('@/lib/adminGuard', () => ({
  requireAdmin: (...args: unknown[]) => requireAdminMock(...args),
}))

const createMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminPasskey: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}))

const verifyRegistrationResponseMock = vi.fn()

vi.mock('@simplewebauthn/server', () => ({
  verifyRegistrationResponse: (...args: unknown[]) => verifyRegistrationResponseMock(...args),
}))

const SESSION = { user: { id: 'admin-1', email: 'suleyman@skompxcel.com', isAdmin: true } }

const REGISTRATION_RESPONSE = {
  id: 'new-cred-id',
  rawId: 'new-cred-id',
  type: 'public-key',
  response: {},
  clientExtensionResults: {},
}

function makeRequest(body: unknown, cookie?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (cookie) headers.cookie = `${REGISTRATION_CHALLENGE_COOKIE}=${cookie}`
  return new NextRequest('http://localhost/api/admin/passkeys/register/verify', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/passkeys/register/verify', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
    delete process.env.WEBAUTHN_RP_ID
    delete process.env.WEBAUTHN_ORIGINS
  })

  it('rejects an unauthenticated request with 401', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ response: REGISTRATION_RESPONSE }, sealChallenge('c')))

    expect(res.status).toBe(401)
    expect(verifyRegistrationResponseMock).not.toHaveBeenCalled()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('rejects a request with no challenge cookie with 400', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ response: REGISTRATION_RESPONSE }))

    expect(res.status).toBe(400)
    expect(verifyRegistrationResponseMock).not.toHaveBeenCalled()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('rejects a tampered challenge cookie with 400', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    const { POST } = await import('./route')
    const tampered = sealChallenge('real-challenge').replace('real', 'evil')

    const res = await POST(makeRequest({ response: REGISTRATION_RESPONSE }, tampered))

    expect(res.status).toBe(400)
    expect(verifyRegistrationResponseMock).not.toHaveBeenCalled()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('rejects with 400 when verification fails and does not persist', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    verifyRegistrationResponseMock.mockResolvedValue({ verified: false })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ response: REGISTRATION_RESPONSE }, sealChallenge('c')))

    expect(res.status).toBe(400)
    expect(createMock).not.toHaveBeenCalled()
  })

  it('persists a verified passkey with the base64url public key and the given label', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    verifyRegistrationResponseMock.mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: {
          id: 'new-cred-id',
          publicKey: new Uint8Array([1, 2, 3, 4]),
          counter: 0,
          transports: ['internal', 'hybrid'],
        },
      },
    })
    createMock.mockResolvedValue({ id: 'pk-new', label: 'MacBook Touch ID' })
    const { POST } = await import('./route')

    const res = await POST(
      makeRequest(
        { response: REGISTRATION_RESPONSE, label: 'MacBook Touch ID' },
        sealChallenge('the-challenge')
      )
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true, id: 'pk-new', label: 'MacBook Touch ID' })

    const verifyCall = verifyRegistrationResponseMock.mock.calls[0][0]
    expect(verifyCall.response).toEqual(REGISTRATION_RESPONSE)
    expect(verifyCall.expectedChallenge).toBe('the-challenge')
    expect(verifyCall.expectedRPID).toBe('suleyman.io')
    expect(verifyCall.expectedOrigin).toEqual(['https://www.suleyman.io', 'https://suleyman.io'])

    expect(createMock).toHaveBeenCalledWith({
      data: {
        credentialId: 'new-cred-id',
        publicKey: 'AQIDBA', // base64url of [1, 2, 3, 4]
        counter: 0,
        transports: 'internal,hybrid',
        label: 'MacBook Touch ID',
        adminUserId: 'admin-1',
      },
    })

    // The one-time challenge cookie is cleared after use.
    expect(res.cookies.get(REGISTRATION_CHALLENGE_COOKIE)?.value).toBe('')
  })

  it('falls back to a dated default label when none is given', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    verifyRegistrationResponseMock.mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: { id: 'new-cred-id', publicKey: new Uint8Array([1]), counter: 0 },
      },
    })
    createMock.mockResolvedValue({ id: 'pk-new', label: 'whatever' })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ response: REGISTRATION_RESPONSE }, sealChallenge('c')))

    expect(res.status).toBe(200)
    const createCall = createMock.mock.calls[0][0]
    expect(createCall.data.label).toMatch(/^Passkey \d{4}-\d{2}-\d{2}$/)
    expect(createCall.data.transports).toBeNull()
  })

  it('returns 409 when the credential is already registered', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    verifyRegistrationResponseMock.mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: { id: 'new-cred-id', publicKey: new Uint8Array([1]), counter: 0 },
      },
    })
    createMock.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ response: REGISTRATION_RESPONSE }, sealChallenge('c')))

    expect(res.status).toBe(409)
  })
})
