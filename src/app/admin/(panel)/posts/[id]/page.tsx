import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostEditor } from '@/components/admin/PostEditor'
import { AdminPageHeader, linkAccentClass } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit post — Admin',
  robots: { index: false, follow: false },
}

type Params = Promise<{ id: string }>

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        path={`~/admin/posts/${post.slug}`}
        title={`Edit: ${post.title || post.slug}`}
        meta={`status ${post.status.toLowerCase()}`}
        actions={
          <Link href="/admin/posts" className={linkAccentClass}>
            ← back to posts
          </Link>
        }
      />
      <PostEditor mode="edit" initial={post} />
    </div>
  )
}
