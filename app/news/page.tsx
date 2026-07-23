export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { kind: "news", status: "published" },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <PageWrap>
      <PageHead eyebrow="News" title="News" desc="Latest updates, announcements, and news from Synthos." />
      <div className="blog-grid">
        {posts.map((post) => (
          <article key={post.id} className="blog-card">
            {post.coverImage && (
              <div className="blog-card-img">
                <img src={post.coverImage} alt={post.title} />
              </div>
            )}
            <div className="blog-card-body">
              <span className="eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
              <h3>{post.title}</h3>
              {post.excerpt && <p className="tiny muted">{post.excerpt}</p>}
              <Link href={`/news/${post.slug}`} className="btn btn-ghost btn-sm">Read more →</Link>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No news posts yet.</p>
          </div>
        )}
      </div>
    </PageWrap>
  )
}
