import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const upsertMock = vi.fn()
const findUniqueMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    siteSetting: {
      upsert: (...args: unknown[]) => upsertMock(...args),
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}))

const TOKEN = 'test-ingest-token'

const SNAPSHOT = {
  generatedAt: '2026-09-05T12:00:00.000Z',
  counts: { enabledTimers: 68, enabledUnits: 74, watchers: 3 },
  events: [
    {
      t: '2026-09-05T11:55:00.000Z',
      label: 'autobuilder shipped tested project',
      kind: 'build',
      status: 'ok',
    },
    {
      t: '2026-09-05T11:30:00.000Z',
      label: 'career-engine tailored resume',
      kind: 'automation',
      status: 'ok',
    },
    {
      t: '2026-09-05T11:02:00.000Z',
      label: 'doc-watcher audit ready: reply sent',
      kind: 'watcher',
      status: 'warn',
    },
  ],
  health: { status: 'nominal', lastHeartbeat: '2026-09-05T11:58:00.000Z' },
}

function makeRequest(body: unknown, token: string | null = TOKEN): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (token !== null) headers.authorization = `Bearer ${token}`
  return new NextRequest('http://localhost/api/admin/telemetry', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/telemetry', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOG_INGEST_TOKEN = TOKEN
  })

  it('rejects a request with no token with 401 and does not write', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest(SNAPSHOT, null))

    expect(res.status).toBe(401)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('rejects a request with a wrong token with 401 and does not write', async () => {
    const { POST } = await import('./route')

    const res = await POST(makeRequest(SNAPSHOT, 'wrong-token'))

    expect(res.status).toBe(401)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('rejects an oversize events array (13 > 12) with 400', async () => {
    const { POST } = await import('./route')
    const events = Array.from({ length: 13 }, (_, i) => ({
      t: '2026-09-05T11:00:00.000Z',
      label: `event ${i}`,
      kind: 'automation',
      status: 'ok',
    }))

    const res = await POST(makeRequest({ ...SNAPSHOT, events }))

    expect(res.status).toBe(400)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('rejects a label with characters outside the allowlist with 400', async () => {
    const { POST } = await import('./route')
    const events = [
      {
        t: '2026-09-05T11:00:00.000Z',
        label: '<script>alert(1)</script>',
        kind: 'automation',
        status: 'ok',
      },
    ]

    const res = await POST(makeRequest({ ...SNAPSHOT, events }))

    expect(res.status).toBe(400)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('rejects an unknown event kind with 400', async () => {
    const { POST } = await import('./route')
    const events = [
      {
        t: '2026-09-05T11:00:00.000Z',
        label: 'a deploy event',
        kind: 'deploy',
        status: 'ok',
      },
    ]

    const res = await POST(makeRequest({ ...SNAPSHOT, events }))

    expect(res.status).toBe(400)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('rejects an out-of-range count with 400', async () => {
    const { POST } = await import('./route')

    const res = await POST(
      makeRequest({
        ...SNAPSHOT,
        counts: { ...SNAPSHOT.counts, watchers: 21 },
      })
    )

    expect(res.status).toBe(400)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('accepts a valid snapshot with 200 and upserts the single system.telemetry row', async () => {
    upsertMock.mockResolvedValue({})
    const { POST } = await import('./route')

    const res = await POST(makeRequest(SNAPSHOT))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(upsertMock).toHaveBeenCalledTimes(1)
    const call = upsertMock.mock.calls[0][0]
    expect(call.where).toEqual({ key: 'system.telemetry' })
    expect(call.create.key).toBe('system.telemetry')
    expect(JSON.parse(call.create.value)).toEqual(SNAPSHOT)
    expect(JSON.parse(call.update.value)).toEqual(SNAPSHOT)
  })
})

describe('GET /api/admin/telemetry', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BLOG_INGEST_TOKEN = TOKEN
  })

  it('returns the stored snapshot JSON without auth', async () => {
    findUniqueMock.mockResolvedValue({
      key: 'system.telemetry',
      value: JSON.stringify(SNAPSHOT),
    })
    const { GET } = await import('./route')

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(SNAPSHOT)
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { key: 'system.telemetry' },
    })
  })

  it('returns 404 when no snapshot is stored', async () => {
    findUniqueMock.mockResolvedValue(null)
    const { GET } = await import('./route')

    const res = await GET()

    expect(res.status).toBe(404)
  })
})
