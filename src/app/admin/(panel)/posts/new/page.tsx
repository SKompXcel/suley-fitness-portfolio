import Link from 'next/link'
import { PostEditor } from '@/components/admin/PostEditor'
import { AdminPageHeader, linkAccentClass } from '@/components/admin/hud'

export const metadata = {
  title: 'New post — Admin',
  robots: { index: false, follow: false },
}

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        path="~/admin/posts/new"
        title="New post"
        actions={
          <Link href="/admin/posts" className={linkAccentClass}>
            ← back to posts
          </Link>
        }
      />
      <PostEditor mode="create" />
    </div>
  )
}
