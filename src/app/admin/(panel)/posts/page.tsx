import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PostsTable } from '@/components/admin/PostsTable'
import { AdminPageHeader, btnPrimaryClass } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Posts — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      scheduledAt: true,
      updatedAt: true,
      tags: true,
    },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        path="~/admin/posts"
        title="Posts"
        meta={`${posts.length} total · published on /articles`}
        actions={
          <Link href="/admin/posts/new" className={btnPrimaryClass}>
            + new post
          </Link>
        }
      />

      <PostsTable
        posts={posts.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          status: p.status,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          scheduledAt: p.scheduledAt?.toISOString() ?? null,
          updatedAt: p.updatedAt.toISOString(),
          tags: p.tags,
        }))}
      />
    </div>
  )
}
