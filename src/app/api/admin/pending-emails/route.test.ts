import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const findManyMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pendingEmail: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}))

const TOKEN = 'test-ingest-token'

function makeRequest(token: string | null = TOKEN): NextRequest {
  const headers: Record<string, string> = {}
  if (token !== null) headers.authorization = `Bearer ${token}`
  return new NextRequest('http://localhost/api/admin/pending-emails', {
    method: 'GET',
    headers,
  })
}

describe('GET /api/admin/pending-emails', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOG_INGEST_TOKEN = TOKEN
  })

  it('rejects a request with no token with 401 and does not read', async () => {
    const { GET } = await import('./route')

    const res = await GET(makeRequest(null))

    expect(res.status).toBe(401)
    expect(findManyMock).not.toHaveBeenCalled()
  })

  it('rejects a request with a wrong token with 401', async () => {
    const { GET } = await import('./route')

    const res = await GET(makeRequest('wrong-token'))

    expect(res.status).toBe(401)
    expect(findManyMock).not.toHaveBeenCalled()
  })

  it('returns up to 10 queued rows, oldest first', async () => {
    const rows = [
      {
        id: 'a',
        toAddr: 'suleyman@skompxcel.com',
        subject: 'suleyman.io admin password reset',
        body: 'link',
        attempts: 0,
        createdAt: new Date('2026-09-05T12:00:00Z'),
      },
    ]
    findManyMock.mockResolvedValue(rows)
    const { GET } = await import('./route')

    const res = await GET(makeRequest())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.emails).toHaveLength(1)
    expect(body.emails[0]).toMatchObject({
      id: 'a',
      toAddr: 'suleyman@skompxcel.com',
      subject: 'suleyman.io admin password reset',
      body: 'link',
      attempts: 0,
    })
    expect(findManyMock).toHaveBeenCalledTimes(1)
    const query = findManyMock.mock.calls[0][0]
    expect(query.where).toEqual({ status: 'queued' })
    expect(query.take).toBe(10)
    expect(query.orderBy).toEqual({ createdAt: 'asc' })
  })
})
