import { prisma } from '@/lib/prisma'
import { MediaList } from '@/components/admin/MediaList'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { AdminPageHeader } from '@/components/admin/hud'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Media — Admin',
  robots: { index: false, follow: false },
}

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { uploadedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        path="~/admin/media"
        title="Media library"
        meta={`${media.length} files · Vercel Blob via /api/admin/upload`}
      />

      <MediaUploader />

      <MediaList
        media={media.map((m) => ({
          id: m.id,
          url: m.url,
          pathname: m.pathname,
          contentType: m.contentType,
          size: m.size,
          uploadedAt: m.uploadedAt.toISOString(),
        }))}
      />
    </div>
  )
}
