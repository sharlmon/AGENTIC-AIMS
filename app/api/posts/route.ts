export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const kind = searchParams.get("kind") || undefined
  const status = searchParams.get("status") || undefined

  const where: any = {}
  if (kind) where.kind = kind
  if (status) where.status = status

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const body = await req.json()
  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      kind: body.kind || "blog",
      status: body.status || "draft",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      authorId: body.authorId,
      authorName: body.authorName,
      tags: body.tags || [],
    },
  })
  return NextResponse.json(post, { status: 201 })
}
