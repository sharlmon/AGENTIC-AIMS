import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const t = await prisma.transcript.findUnique({ where: { projectId: params.id } })
  return NextResponse.json(t)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const existing = await prisma.transcript.findUnique({ where: { projectId: params.id } })
  const t = existing
    ? await prisma.transcript.update({ where: { projectId: params.id }, data: body })
    : await prisma.transcript.create({ data: { ...body, projectId: params.id } })
  return NextResponse.json(t, { status: existing ? 200 : 201 })
}
