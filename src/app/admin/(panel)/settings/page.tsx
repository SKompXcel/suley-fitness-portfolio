import { getAllSettings } from '@/lib/siteSettings'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { PasskeysCard } from '@/components/admin/PasskeysCard'
import { AdminPageHeader } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  const settings = await getAllSettings()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        path="~/admin/settings"
        title="Site settings"
        meta="hero + social links · blank fields fall back to built-in defaults"
      />

      <SettingsForm initial={settings} />

      <PasskeysCard />
    </div>
  )
}
