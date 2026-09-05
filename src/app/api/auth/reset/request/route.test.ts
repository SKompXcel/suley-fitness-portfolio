import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { NextRequest } from 'next/server'

const adminFindUniqueMock = vi.fn()
const tokenFindFirstMock = vi.fn()
const tokenUpdateManyMock = vi.fn()
const tokenCreateMock = vi.fn()
const emailFindFirstMock = vi.fn()
const emailCreateMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminUser: {
      findUnique: (...args: unknown[]) => adminFindUniqueMock(...args),
    },
    passwordResetToken: {
      findFirst: (...args: unknown[]) => tokenFindFirstMock(...args),
      updateMany: (...args: unknown[]) => tokenUpdateManyMock(...args),
      create: (...args: unknown[]) => tokenCreateMock(...args),
    },
    pendingEmail: {
      findFirst: (...args: unknown[]) => emailFindFirstMock(...args),
      create: (...args: unknown[]) => emailCreateMock(...args),
    },
  },
}))

const USER = { id: 'admin1', email: 'suleyman@skompxcel.com' }

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/reset/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/reset/request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    tokenFindFirstMock.mockResolvedValue(null)
    tokenUpdateManyMock.mockResolvedValue({ count: 0 })
    tokenCreateMock.mockResolvedValue({})
    emailFindFirstMock.mockResolvedValue(null)
    emailCreateMock.mockResolvedValue({})
  })

  it('returns the identical ok:true body for an unknown email and writes nothing', async () => {
    adminFindUniqueMock.mockResolvedValue(null)
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ email: 'nobody@example.com' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(tokenCreateMock).not.toHaveBeenCalled()
    expect(emailCreateMock).not.toHaveBeenCalled()
  })

  it('creates a hashed token and queues one email for a known account', async () => {
    adminFindUniqueMock.mockResolvedValue(USER)
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ email: 'Suleyman@SkompXcel.com ' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(adminFindUniqueMock).toHaveBeenCalledWith({
      where: { email: 'suleyman@skompxcel.com' },
    })

    // Prior unused tokens are invalidated before the new one is minted.
    expect(tokenUpdateManyMock).toHaveBeenCalledTimes(1)
    expect(tokenUpdateManyMock.mock.calls[0][0].where).toMatchObject({
      adminUserId: USER.id,
      usedAt: null,
    })

    // The stored hash is sha256 hex of the raw token — never the raw token.
    expect(tokenCreateMock).toHaveBeenCalledTimes(1)
    const tokenData = tokenCreateMock.mock.calls[0][0].data
    expect(tokenData.adminUserId).toBe(USER.id)
    expect(tokenData.tokenHash).toMatch(/^[0-9a-f]{64}$/)
    const expiresIn = tokenData.expiresAt.getTime() - Date.now()
    expect(expiresIn).toBeGreaterThan(29 * 60 * 1000)
    expect(expiresIn).toBeLessThanOrEqual(30 * 60 * 1000)

    // The queued email carries the RAW token in the reset link, addressed to
    // the account email, and the raw token hashes to the stored hash.
    expect(emailCreateMock).toHaveBeenCalledTimes(1)
    const emailData = emailCreateMock.mock.calls[0][0].data
    expect(emailData.toAddr).toBe(USER.email)
    expect(emailData.subject).toBe('suleyman.io admin password reset')
    const match = emailData.body.match(
      /https:\/\/www\.suleyman\.io\/admin\/reset\?token=([A-Za-z0-9_-]+)/
    )
    expect(match).not.toBeNull()
    const rawToken = match![1]
    expect(rawToken).not.toBe(tokenData.tokenHash)
    expect(createHash('sha256').update(rawToken).digest('hex')).toBe(
      tokenData.tokenHash
    )
  })

  it('silently declines to enqueue while an active token has a fresh queued email', async () => {
    adminFindUniqueMock.mockResolvedValue(USER)
    tokenFindFirstMock.mockResolvedValue({ id: 'tok1' })
    emailFindFirstMock.mockResolvedValue({ id: 'mail1' })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ email: USER.email }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(tokenUpdateManyMock).not.toHaveBeenCalled()
    expect(tokenCreateMock).not.toHaveBeenCalled()
    expect(emailCreateMock).not.toHaveBeenCalled()
  })

  it('re-enqueues when the active token exists but its queued email is stale', async () => {
    adminFindUniqueMock.mockResolvedValue(USER)
    tokenFindFirstMock.mockResolvedValue({ id: 'tok1' })
    emailFindFirstMock.mockResolvedValue(null) // nothing queued in the window
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ email: USER.email }))

    expect(res.status).toBe(200)
    expect(tokenCreateMock).toHaveBeenCalledTimes(1)
    expect(emailCreateMock).toHaveBeenCalledTimes(1)
  })

  it('returns the same ok:true body even when the database write fails', async () => {
    adminFindUniqueMock.mockResolvedValue(USER)
    tokenCreateMock.mockRejectedValue(new Error('db down'))
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ email: USER.email }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
  })

  it('rejects a body without a usable email with 400', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ email: 42 }))

    expect(res.status).toBe(400)
    expect(adminFindUniqueMock).not.toHaveBeenCalled()
  })
})
