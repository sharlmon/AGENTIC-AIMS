import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await prisma.understanding.findUnique({
    where: { projectId: params.id },
    include: { insights: true },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const existing = await prisma.understanding.findUnique({ where: { projectId: params.id } })
  const data = existing
    ? await prisma.understanding.update({ where: { projectId: params.id }, data: { ...body, insights: { deleteMany: {}, create: (body.insights || []).map((i: any) => ({ ...i })) } } })
    : await prisma.understanding.create({ data: { ...body, projectId: params.id, insights: { create: (body.insights || []).map((i: any) => ({ ...i })) } } })
  return NextResponse.json(data, { status: existing ? 200 : 201 })
}
