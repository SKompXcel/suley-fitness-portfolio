import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const findUniqueMock = vi.fn()
const updateMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pendingEmail: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}))

const TOKEN = 'test-ingest-token'

function makeRequest(body: unknown, token: string | null = TOKEN): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (token !== null) headers.authorization = `Bearer ${token}`
  return new NextRequest('http://localhost/api/admin/pending-emails/ack', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/pending-emails/ack', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOG_INGEST_TOKEN = TOKEN
    updateMock.mockResolvedValue({})
  })

  it('rejects a request with no token with 401 and does not write', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'sent' }, null))

    expect(res.status).toBe(401)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('rejects an unknown status value with 400', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'delivered' }))

    expect(res.status).toBe(400)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown row id', async () => {
    findUniqueMock.mockResolvedValue(null)
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'gone', status: 'sent' }))

    expect(res.status).toBe(404)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('stamps a sent row with status sent and sentAt', async () => {
    findUniqueMock.mockResolvedValue({ id: 'a', status: 'queued', attempts: 0 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'sent' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(updateMock).toHaveBeenCalledTimes(1)
    const call = updateMock.mock.calls[0][0]
    expect(call.where).toEqual({ id: 'a' })
    expect(call.data.status).toBe('sent')
    expect(call.data.sentAt).toBeInstanceOf(Date)
  })

  it('a failed ack increments attempts and keeps the row queued for retry', async () => {
    findUniqueMock.mockResolvedValue({ id: 'a', status: 'queued', attempts: 0 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'failed' }))

    expect(res.status).toBe(200)
    const call = updateMock.mock.calls[0][0]
    expect(call.data).toEqual({ attempts: 1, status: 'queued' })
  })

  it('the third failed ack parks the row failed permanently', async () => {
    findUniqueMock.mockResolvedValue({ id: 'a', status: 'queued', attempts: 2 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'failed' }))

    expect(res.status).toBe(200)
    const call = updateMock.mock.calls[0][0]
    expect(call.data).toEqual({ attempts: 3, status: 'failed' })
  })
})
