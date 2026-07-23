export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const career = await prisma.career.findUnique({ where: { id: params.id } })
  if (!career) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(career)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const career = await prisma.career.update({
    where: { id: params.id },
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      requirements: body.requirements,
      type: body.type,
      location: body.location,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      status: body.status,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  })
  return NextResponse.json(career)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.career.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
