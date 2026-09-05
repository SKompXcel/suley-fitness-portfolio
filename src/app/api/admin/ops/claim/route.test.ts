import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const updateManyMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    opsIntent: {
      updateMany: (...args: unknown[]) => updateManyMock(...args),
    },
  },
}))

const TOKEN = 'test-ingest-token'

function makeRequest(body: unknown, token: string | null = TOKEN): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (token !== null) headers.authorization = `Bearer ${token}`
  return new NextRequest('http://localhost/api/admin/ops/claim', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/ops/claim', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOG_INGEST_TOKEN = TOKEN
  })

  it('rejects a request with no token with 401 and does not write', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a' }, null))

    expect(res.status).toBe(401)
    expect(updateManyMock).not.toHaveBeenCalled()
  })

  it('rejects a body without a string id with 400', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
    expect(updateManyMock).not.toHaveBeenCalled()
  })

  it('claims a pending intent atomically (pending -> executing + startedAt)', async () => {
    updateManyMock.mockResolvedValue({ count: 1 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, claimed: true })
    expect(updateManyMock).toHaveBeenCalledTimes(1)
    const query = updateManyMock.mock.calls[0][0]
    expect(query.where).toEqual({ id: 'a', status: 'pending' })
    expect(query.data.status).toBe('executing')
    expect(query.data.startedAt).toBeInstanceOf(Date)
  })

  it('returns claimed:false when the claim lost the race (row no longer pending)', async () => {
    updateManyMock.mockResolvedValue({ count: 0 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, claimed: false })
  })
})
