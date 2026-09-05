import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { AdminShell } from '@/components/admin/AdminShell'

// Shell layout for every admin page EXCEPT /admin/login, which stays outside
// this route group and keeps the public chrome.

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  return <AdminShell email={session?.user?.email ?? null}>{children}</AdminShell>
}
