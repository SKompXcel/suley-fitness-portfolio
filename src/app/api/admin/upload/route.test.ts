import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const requireAdminMock = vi.fn()
const delMock = vi.fn()
const findUniqueMock = vi.fn()
const deleteMock = vi.fn()
const createMock = vi.fn()

vi.mock('@/lib/adminGuard', () => ({
  requireAdmin: (...args: unknown[]) => requireAdminMock(...args),
}))

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  del: (...args: unknown[]) => delMock(...args),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    media: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}))

function makeDelete(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/upload', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('DELETE /api/admin/upload', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    requireAdminMock.mockResolvedValue({ user: { isAdmin: true } })
  })

  it('rejects an unauthenticated caller with 401 and touches nothing', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { DELETE } = await import('./route')

    const res = await DELETE(makeDelete({ id: 'm1' }))

    expect(res.status).toBe(401)
    expect(delMock).not.toHaveBeenCalled()
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('rejects a body without an id with 400', async () => {
    const { DELETE } = await import('./route')

    const res = await DELETE(makeDelete({}))

    expect(res.status).toBe(400)
    expect(delMock).not.toHaveBeenCalled()
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown media id without deleting any blob', async () => {
    findUniqueMock.mockResolvedValue(null)
    const { DELETE } = await import('./route')

    const res = await DELETE(makeDelete({ id: 'missing' }))

    expect(res.status).toBe(404)
    expect(delMock).not.toHaveBeenCalled()
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('deletes the blob AND the prisma row for a known id', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'm1',
      url: 'https://blob.example.com/admin/123-cover.png',
    })
    delMock.mockResolvedValue(undefined)
    deleteMock.mockResolvedValue({})
    const { DELETE } = await import('./route')

    const res = await DELETE(makeDelete({ id: 'm1' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(delMock).toHaveBeenCalledWith('https://blob.example.com/admin/123-cover.png')
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: 'm1' } })
  })
})
