import { describe, it, expect, beforeEach, vi } from 'vitest'

const requireAdminMock = vi.fn()

vi.mock('@/lib/adminGuard', () => ({
  requireAdmin: (...args: unknown[]) => requireAdminMock(...args),
}))

const findManyMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminPasskey: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}))

const SESSION = { user: { id: 'admin-1', email: 'suleyman@skompxcel.com', isAdmin: true } }

describe('GET /api/admin/passkeys', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects an unauthenticated request with 401', async () => {
    requireAdminMock.mockRejectedValue(new Error('Unauthorized'))
    const { GET } = await import('./route')

    const res = await GET()

    expect(res.status).toBe(401)
    expect(findManyMock).not.toHaveBeenCalled()
  })

  it("lists the admin's passkeys with transports split into arrays", async () => {
    requireAdminMock.mockResolvedValue(SESSION)
    findManyMock.mockResolvedValue([
      {
        id: 'pk-1',
        label: 'iPhone Face ID',
        createdAt: new Date('2026-09-01T00:00:00.000Z'),
        lastUsedAt: new Date('2026-09-04T12:00:00.000Z'),
        transports: 'internal,hybrid',
      },
      {
        id: 'pk-2',
        label: '1Password',
        createdAt: new Date('2026-09-02T00:00:00.000Z'),
        lastUsedAt: null,
        transports: null,
      },
    ])
    const { GET } = await import('./route')

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      ok: true,
      passkeys: [
        {
          id: 'pk-1',
          label: 'iPhone Face ID',
          createdAt: '2026-09-01T00:00:00.000Z',
          lastUsedAt: '2026-09-04T12:00:00.000Z',
          transports: ['internal', 'hybrid'],
        },
        {
          id: 'pk-2',
          label: '1Password',
          createdAt: '2026-09-02T00:00:00.000Z',
          lastUsedAt: null,
          transports: [],
        },
      ],
    })
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { adminUserId: 'admin-1' } })
    )
  })
})
