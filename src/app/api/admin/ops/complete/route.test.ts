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
  return new NextRequest('http://localhost/api/admin/ops/complete', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/ops/complete', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOG_INGEST_TOKEN = TOKEN
  })

  it('rejects a request with no token with 401 and does not write', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'done' }, null))

    expect(res.status).toBe(401)
    expect(updateManyMock).not.toHaveBeenCalled()
  })

  it('rejects a status outside done|failed with 400', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'pending' }))

    expect(res.status).toBe(400)
    expect(updateManyMock).not.toHaveBeenCalled()
  })

  it('stamps a done completion with finishedAt, resultUrl and resultNote', async () => {
    updateManyMock.mockResolvedValue({ count: 1 })
    const { POST } = await import('./route')

    const res = await POST(
      makeRequest({
        id: 'a',
        status: 'done',
        resultUrl: 'https://github.com/SKompStudio/suleyman.io/pull/99',
        resultNote: 'proposal card queued for approval',
      })
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, completed: true })
    const query = updateManyMock.mock.calls[0][0]
    expect(query.where).toEqual({ id: 'a', status: 'executing' })
    expect(query.data.status).toBe('done')
    expect(query.data.finishedAt).toBeInstanceOf(Date)
    expect(query.data.resultUrl).toBe('https://github.com/SKompStudio/suleyman.io/pull/99')
    expect(query.data.resultNote).toBe('proposal card queued for approval')
  })

  it('stamps a failed completion with the error text', async () => {
    updateManyMock.mockResolvedValue({ count: 1 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'failed', error: 'exit 2' }))

    expect(res.status).toBe(200)
    const query = updateManyMock.mock.calls[0][0]
    expect(query.data.status).toBe('failed')
    expect(query.data.error).toBe('exit 2')
  })

  it('refuses to complete a row that is not executing (409, FSM preserved)', async () => {
    updateManyMock.mockResolvedValue({ count: 0 })
    const { POST } = await import('./route')

    const res = await POST(makeRequest({ id: 'a', status: 'done' }))

    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({ ok: false })
  })
})
