import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const requireAdminMock = vi.fn()

vi.mock('@/lib/adminGuard', () => ({
  requireAdmin: (...args: unknown[]) => requireAdminMock(...args),
}))

const findManyMock = vi.fn()
const findFirstMock = vi.fn()
const createMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    opsIntent: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}))

const SESSION = { user: { id: 'admin-1', email: 'suleyman@skompxcel.com', isAdmin: true } }

function makePost(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/ops', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/admin/ops', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects an unauthenticated request with 401 and does not read', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { GET } = await import('./route')

    const res = await GET()

    expect(res.status).toBe(401)
    expect(findManyMock).not.toHaveBeenCalled()
  })

  it('returns the last 20 intents, newest first', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    const rows = [
      {
        id: 'b',
        kind: 'kb_site_sync',
        status: 'pending',
        requestedAt: new Date('2026-09-05T12:05:00Z'),
        startedAt: null,
        finishedAt: null,
        resultUrl: null,
        resultNote: null,
        error: null,
      },
    ]
    findManyMock.mockResolvedValue(rows)
    const { GET } = await import('./route')

    const res = await GET()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.intents).toHaveLength(1)
    expect(body.intents[0]).toMatchObject({ id: 'b', kind: 'kb_site_sync', status: 'pending' })
    const query = findManyMock.mock.calls[0][0]
    expect(query.orderBy).toEqual({ requestedAt: 'desc' })
    expect(query.take).toBe(20)
  })
})

describe('POST /api/admin/ops', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects an unauthenticated request with 401 and does not write', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { POST } = await import('./route')

    const res = await POST(makePost({ kind: 'kb_site_sync' }))

    expect(res.status).toBe(401)
    expect(createMock).not.toHaveBeenCalled()
  })

  it('rejects a kind outside the closed set with 400', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    const { POST } = await import('./route')

    const res = await POST(makePost({ kind: 'rm_rf_slash' }))

    expect(res.status).toBe(400)
    expect(createMock).not.toHaveBeenCalled()
  })

  it('refuses a duplicate kind while one is already pending or executing (409)', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    findFirstMock.mockResolvedValue({ id: 'existing', status: 'executing' })
    const { POST } = await import('./route')

    const res = await POST(makePost({ kind: 'resume_refresh' }))

    expect(res.status).toBe(409)
    expect(createMock).not.toHaveBeenCalled()
    const query = findFirstMock.mock.calls[0][0]
    expect(query.where).toEqual({
      kind: 'resume_refresh',
      status: { in: ['pending', 'executing'] },
    })
  })

  it('mints a pending intent for a valid kind with no duplicate in flight', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    findFirstMock.mockResolvedValue(null)
    createMock.mockResolvedValue({
      id: 'new-1',
      kind: 'full_refresh',
      status: 'pending',
      requestedAt: new Date('2026-09-05T12:10:00Z'),
    })
    const { POST } = await import('./route')

    const res = await POST(makePost({ kind: 'full_refresh' }))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.intent).toMatchObject({ id: 'new-1', kind: 'full_refresh', status: 'pending' })
    expect(createMock).toHaveBeenCalledWith({ data: { kind: 'full_refresh' } })
  })
})
