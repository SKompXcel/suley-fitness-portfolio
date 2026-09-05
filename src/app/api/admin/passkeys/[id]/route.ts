import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'

// prisma initializes eagerly (throws on a missing DATABASE_URL), so this route
// must not be collected at build time. Mirrors the other DB-backed API routes.
export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

// DELETE: remove one of the signed-in admin's passkeys. Password sign-in always
// remains as fallback, so deleting the last passkey is allowed.
export async function DELETE(_request: NextRequest, { params }: { params: Params }) {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // deleteMany scoped to the session's user so an id can never delete someone
  // else's credential; count 0 means not found (or not theirs).
  const result = await prisma.adminPasskey.deleteMany({
    where: { id, adminUserId: session.user.id },
  })

  if (result.count === 0) {
    return NextResponse.json({ ok: false, error: 'Passkey not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
