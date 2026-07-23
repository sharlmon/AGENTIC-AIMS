export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import { notFound } from "next/navigation"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, kind: "news" },
  })

  if (!post || post.status !== "published") {
    notFound()
  }

  return (
    <PageWrap>
      <Link href="/news" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← Back to news</Link>
      <article className="post-full">
        {post.coverImage && (
          <div className="post-full-img">
            <img src={post.coverImage} alt={post.title} />
          </div>
        )}
        <div className="post-full-body">
          <span className="eyebrow">News · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
          <h1 className="display" style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", margin: "8px 0 14px" }}>{post.title}</h1>
          {post.excerpt && <p className="lede" style={{ marginBottom: 20 }}>{post.excerpt}</p>}
          <div style={{ color: "var(--ink-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{post.content}</div>
          {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
            <div className="row gap-2 wrap" style={{ marginTop: 28 }}>
              {(post.tags as string[]).map((tag: string) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </PageWrap>
  )
}
