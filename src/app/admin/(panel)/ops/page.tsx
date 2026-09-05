import { AdminPageHeader } from '@/components/admin/hud'
import { OpsConsole } from '@/components/admin/OpsConsole'

export const metadata = {
  title: 'Ops — Admin',
  robots: { index: false, follow: false },
}

export default function AdminOpsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        path="~/admin/ops"
        title="Ops console"
        meta="on-demand update runs · picked up by the home server within 5 minutes · results land as PRs or approval cards, never direct pushes"
      />

      <OpsConsole />
    </div>
  )
}
