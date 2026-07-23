export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined

  const where: any = {}
  if (status) where.status = status

  const careers = await prisma.career.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(careers)
}

export async function POST(req: Request) {
  const body = await req.json()
  const career = await prisma.career.create({
    data: {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      description: body.description,
      requirements: body.requirements || [],
      type: body.type || "full-time",
      location: body.location,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      status: body.status || "open",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  })
  return NextResponse.json(career, { status: 201 })
}
