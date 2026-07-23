import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const brief = await prisma.brief.findUnique({ where: { projectId: params.id } })
  return NextResponse.json(brief)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const existing = await prisma.brief.findUnique({ where: { projectId: params.id } })
  const brief = existing
    ? await prisma.brief.update({ where: { projectId: params.id }, data: body })
    : await prisma.brief.create({ data: { ...body, projectId: params.id } })
  return NextResponse.json(brief, { status: existing ? 200 : 201 })
}
