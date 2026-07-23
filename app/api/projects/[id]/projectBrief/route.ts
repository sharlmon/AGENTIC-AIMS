import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await prisma.projectBrief.findUnique({ where: { projectId: params.id } })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const existing = await prisma.projectBrief.findUnique({ where: { projectId: params.id } })
  const data = existing
    ? await prisma.projectBrief.update({ where: { projectId: params.id }, data: body })
    : await prisma.projectBrief.create({ data: { ...body, projectId: params.id } })
  return NextResponse.json(data, { status: existing ? 200 : 201 })
}
