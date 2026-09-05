import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createHash } from 'node:crypto'
import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'

const tokenFindUniqueMock = vi.fn()
const tokenUpdateMock = vi.fn()
const adminUpdateMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      findUnique: (...args: unknown[]) => tokenFindUniqueMock(...args),
      update: (...args: unknown[]) => tokenUpdateMock(...args),
    },
    adminUser: {
      update: (...args: unknown[]) => adminUpdateMock(...args),
    },
  },
}))

const RAW_TOKEN = 'raw-reset-token-abc123'
const TOKEN_HASH = createHash('sha256').update(RAW_TOKEN).digest('hex')
const NEW_PASSWORD = 'a-long-enough-password'

function tokenRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tok1',
    tokenHash: TOKEN_HASH,
    adminUserId: 'admin1',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    usedAt: null,
    ...overrides,
  }
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/reset/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/reset/confirm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    tokenUpdateMock.mockResolvedValue({})
    adminUpdateMock.mockResolvedValue({})
  })

  it('rejects an unknown token with a generic 400 and changes nothing', async () => {
    tokenFindUniqueMock.mockResolvedValue(null)
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ token: RAW_TOKEN, password: NEW_PASSWORD }))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(adminUpdateMock).not.toHaveBeenCalled()
    expect(tokenUpdateMock).not.toHaveBeenCalled()
  })

  it('rejects an expired token with the same generic 400', async () => {
    tokenFindUniqueMock.mockResolvedValue(
      tokenRow({ expiresAt: new Date(Date.now() - 1000) })
    )
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ token: RAW_TOKEN, password: NEW_PASSWORD }))

    expect(res.status).toBe(400)
    expect(adminUpdateMock).not.toHaveBeenCalled()
  })

  it('rejects an already-used token with the same generic 400', async () => {
    tokenFindUniqueMock.mockResolvedValue(tokenRow({ usedAt: new Date() }))
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ token: RAW_TOKEN, password: NEW_PASSWORD }))

    expect(res.status).toBe(400)
    expect(adminUpdateMock).not.toHaveBeenCalled()
  })

  it('rejects a password under 12 characters with 400 before touching the token', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ token: RAW_TOKEN, password: 'elevenchars' }))

    expect(res.status).toBe(400)
    expect(tokenFindUniqueMock).not.toHaveBeenCalled()
    expect(adminUpdateMock).not.toHaveBeenCalled()
  })

  it('looks the token up by sha256 hash, rehashes the password, and burns the token', async () => {
    tokenFindUniqueMock.mockResolvedValue(tokenRow())
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ token: RAW_TOKEN, password: NEW_PASSWORD }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })

    expect(tokenFindUniqueMock).toHaveBeenCalledWith({
      where: { tokenHash: TOKEN_HASH },
    })

    // The stored hash is bcrypt (cost 12, matching scripts/seed-admin.ts) and
    // verifies against the submitted password.
    expect(adminUpdateMock).toHaveBeenCalledTimes(1)
    const adminCall = adminUpdateMock.mock.calls[0][0]
    expect(adminCall.where).toEqual({ id: 'admin1' })
    const storedHash = adminCall.data.passwordHash
    expect(storedHash).toMatch(/^\$2[aby]\$12\$/)
    await expect(bcrypt.compare(NEW_PASSWORD, storedHash)).resolves.toBe(true)

    // The token is single-use: usedAt is stamped.
    expect(tokenUpdateMock).toHaveBeenCalledTimes(1)
    const tokenCall = tokenUpdateMock.mock.calls[0][0]
    expect(tokenCall.where).toEqual({ id: 'tok1' })
    expect(tokenCall.data.usedAt).toBeInstanceOf(Date)
  })
})
