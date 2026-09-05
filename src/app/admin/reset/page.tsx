import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/admin/ResetPasswordForm'

export const metadata = {
  title: 'Set a new password — suleyman.io',
  robots: { index: false, follow: false },
}

export default function AdminResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            The link from your reset email expires 30 minutes after it was requested.
          </p>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
