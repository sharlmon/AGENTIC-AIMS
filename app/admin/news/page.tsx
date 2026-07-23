export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead } from "@/components/app/Page"
import { PostsManager } from "@/components/app/PostsManager"

export default async function AdminNewsPage() {
  const rawPosts = await prisma.post.findMany({
    where: { kind: "news" },
    orderBy: { createdAt: "desc" },
  })
  const posts = rawPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? undefined,
    content: p.content,
    coverImage: p.coverImage ?? undefined,
    kind: p.kind,
    status: p.status,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : undefined,
    authorName: p.authorName ?? undefined,
    tags: (p.tags as any) || [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="News" desc="Manage news posts and announcements." />
      <PostsManager kind="news" initialPosts={posts} />
    </div>
  )
}
