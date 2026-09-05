import { describe, it, expect, beforeEach, vi } from 'vitest'

const findUniqueMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    siteSetting: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}))

function snapshotAt(generatedAt: string) {
  return {
    generatedAt,
    counts: { enabledTimers: 68, enabledUnits: 74, watchers: 3 },
    events: [
      {
        t: '2026-09-05T11:55:00.000Z',
        label: 'autobuilder shipped tested project',
        kind: 'build',
        status: 'ok',
      },
    ],
    health: { status: 'nominal', lastHeartbeat: '2026-09-05T11:58:00.000Z' },
  }
}

describe('getSystemTelemetry', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns the parsed snapshot when the stored row is fresh and valid', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const snapshot = snapshotAt(oneHourAgo)
    findUniqueMock.mockResolvedValue({
      key: 'system.telemetry',
      value: JSON.stringify(snapshot),
    })
    const { getSystemTelemetry } = await import('./systemTelemetry')

    await expect(getSystemTelemetry()).resolves.toEqual(snapshot)
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { key: 'system.telemetry' },
    })
  })

  it('returns null when no row is stored', async () => {
    findUniqueMock.mockResolvedValue(null)
    const { getSystemTelemetry } = await import('./systemTelemetry')

    await expect(getSystemTelemetry()).resolves.toBeNull()
  })

  it('returns null when the stored value is not valid JSON', async () => {
    findUniqueMock.mockResolvedValue({ key: 'system.telemetry', value: 'not json{' })
    const { getSystemTelemetry } = await import('./systemTelemetry')

    await expect(getSystemTelemetry()).resolves.toBeNull()
  })

  it('returns null when the stored value fails the schema', async () => {
    const bad = { ...snapshotAt(new Date().toISOString()), counts: { enabledTimers: -1 } }
    findUniqueMock.mockResolvedValue({
      key: 'system.telemetry',
      value: JSON.stringify(bad),
    })
    const { getSystemTelemetry } = await import('./systemTelemetry')

    await expect(getSystemTelemetry()).resolves.toBeNull()
  })

  it('returns null when generatedAt is older than 24h (staleness guard)', async () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    findUniqueMock.mockResolvedValue({
      key: 'system.telemetry',
      value: JSON.stringify(snapshotAt(twentyFiveHoursAgo)),
    })
    const { getSystemTelemetry } = await import('./systemTelemetry')

    await expect(getSystemTelemetry()).resolves.toBeNull()
  })

  it('returns null when the database read throws (build-time / DB-down safety)', async () => {
    findUniqueMock.mockRejectedValue(new Error('connection refused'))
    const { getSystemTelemetry } = await import('./systemTelemetry')

    await expect(getSystemTelemetry()).resolves.toBeNull()
  })
})
