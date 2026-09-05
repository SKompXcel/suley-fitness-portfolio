import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// The live-telemetry snapshot pushed by the home server (a systemd timer
// POSTing to /api/admin/telemetry). One SiteSetting row holds the latest
// snapshot as a JSON string; the homepage reads it server-side and renders
// honest offline fallbacks when it is missing, invalid, or stale. This schema
// is the contract shared with the server-side pusher — do not loosen it.

export const TELEMETRY_SETTING_KEY = 'system.telemetry'

export const telemetrySnapshotSchema = z.object({
  generatedAt: z.string().datetime({ offset: true }),
  counts: z.object({
    enabledTimers: z.number().int().min(0).max(500),
    enabledUnits: z.number().int().min(0).max(1000),
    watchers: z.number().int().min(0).max(20),
  }),
  events: z
    .array(
      z.object({
        t: z.string().datetime({ offset: true }),
        label: z
          .string()
          .max(60)
          .regex(/^[a-z0-9 .:+()-]+$/i),
        kind: z.enum(['automation', 'build', 'watcher']),
        status: z.enum(['ok', 'warn']),
      })
    )
    .max(12),
  health: z.object({
    status: z.enum(['nominal', 'degraded']),
    lastHeartbeat: z.string().datetime({ offset: true }),
  }),
})

export type TelemetrySnapshot = z.infer<typeof telemetrySnapshotSchema>
export type TelemetryEvent = TelemetrySnapshot['events'][number]

const MAX_AGE_MS = 24 * 60 * 60 * 1000

// Server-side reader for the homepage. Returns null (never throws) when the
// row is missing, unparsable, schema-invalid, or older than 24h — including
// when the database itself is unreachable (the CI build runs with a dummy
// DATABASE_URL), so the page degrades to its honest static state.
export async function getSystemTelemetry(): Promise<TelemetrySnapshot | null> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: TELEMETRY_SETTING_KEY },
    })
    if (!row) return null
    const parsed = telemetrySnapshotSchema.safeParse(JSON.parse(row.value))
    if (!parsed.success) return null
    const age = Date.now() - new Date(parsed.data.generatedAt).getTime()
    if (age > MAX_AGE_MS) return null
    return parsed.data
  } catch {
    return null
  }
}
