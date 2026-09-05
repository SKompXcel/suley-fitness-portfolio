import { NextResponse, type NextRequest } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

const TOKEN_TTL_MS = 30 * 60 * 1000
const RESEND_WINDOW_MS = 5 * 60 * 1000
const RESET_SUBJECT = 'suleyman.io admin password reset'
const RESET_URL_BASE = 'https://www.suleyman.io/admin/reset'

function resetEmailBody(rawToken: string): string {
  return [
    'A password reset was requested for the suleyman.io admin.',
    '',
    'Open this link within 30 minutes to set a new password:',
    '',
    `${RESET_URL_BASE}?token=${rawToken}`,
    '',
    'If you did not request this, ignore this email - the link expires on its own.',
  ].join('\n')
}

// POST: start the break-glass password reset. The response is {ok:true} for
// every well-formed request whether or not the account exists (no account
// enumeration), and also when the writes fail — this endpoint reveals nothing.
// The site cannot send mail (Vercel holds no mail credentials by design), so
// a matching account queues one PendingEmail row that the home server's
// site-reset-mailer timer drains and sends via its Workspace Gmail path.
export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const email = (payload as { email?: unknown } | null)?.email
  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ ok: false, error: 'email is required' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    })
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Rate limit: an unexpired unused token whose queued email is still fresh
    // (<5 min) means a reset is already on its way — silently do nothing.
    const now = new Date()
    const activeToken = await prisma.passwordResetToken.findFirst({
      where: { adminUserId: user.id, usedAt: null, expiresAt: { gt: now } },
    })
    if (activeToken) {
      const freshQueued = await prisma.pendingEmail.findFirst({
        where: {
          toAddr: user.email,
          status: 'queued',
          createdAt: { gte: new Date(now.getTime() - RESEND_WINDOW_MS) },
        },
      })
      if (freshQueued) {
        return NextResponse.json({ ok: true })
      }
    }

    // Only the sha256 hash is stored; the raw token exists solely inside the
    // queued email's reset link.
    const rawToken = randomBytes(32).toString('base64url')
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')

    await prisma.passwordResetToken.updateMany({
      where: { adminUserId: user.id, usedAt: null },
      data: { usedAt: now },
    })
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        adminUserId: user.id,
        expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
      },
    })
    await prisma.pendingEmail.create({
      data: {
        toAddr: user.email,
        subject: RESET_SUBJECT,
        body: resetEmailBody(rawToken),
      },
    })
  } catch {
    // Deliberately swallowed: the response never varies with what happened.
  }
  return NextResponse.json({ ok: true })
}
