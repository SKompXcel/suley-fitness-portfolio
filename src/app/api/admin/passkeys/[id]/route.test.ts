import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const requireAdminMock = vi.fn()

vi.mock('@/lib/adminGuard', () => ({
  requireAdmin: (...args: unknown[]) => requireAdminMock(...args),
}))

const deleteManyMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminPasskey: {
      deleteMany: (...args: unknown[]) => deleteManyMock(...args),
    },
  },
}))

const SESSION = { user: { id: 'admin-1', email: 'suleyman@skompxcel.com', isAdmin: true } }

function makeRequest(id: string): [NextRequest, { params: Promise<{ id: string }> }] {
  return [
    new NextRequest(`http://localhost/api/admin/passkeys/${id}`, { method: 'DELETE' }),
    { params: Promise.resolve({ id }) },
  ]
}

describe('DELETE /api/admin/passkeys/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects an unauthenticated request with 401', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { DELETE } = await import('./route')

    const res = await DELETE(...makeRequest('pk-1'))

    expect(res.status).toBe(401)
    expect(deleteManyMock).not.toHaveBeenCalled()
  })

  it("deletes the admin's passkey scoped to their own user id", async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    deleteManyMock.mockResolvedValue({ count: 1 })
    const { DELETE } = await import('./route')

    const res = await DELETE(...makeRequest('pk-1'))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { id: 'pk-1', adminUserId: 'admin-1' },
    })
  })

  it('returns 404 when the passkey does not exist (or belongs to someone else)', async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    deleteManyMock.mockResolvedValue({ count: 0 })
    const { DELETE } = await import('./route')

    const res = await DELETE(...makeRequest('pk-unknown'))

    expect(res.status).toBe(404)
  })
})
