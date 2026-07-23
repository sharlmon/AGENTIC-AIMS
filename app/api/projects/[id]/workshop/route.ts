import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await prisma.workshop.findUnique({
    where: { projectId: params.id },
    include: { insights: { orderBy: { createdAt: "asc" } } },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const existing = await prisma.workshop.findUnique({ where: { projectId: params.id } })

  const data = existing
    ? await prisma.workshop.update({
        where: { projectId: params.id },
        data: {
          humanNotes: body.humanNotes,
          insights: {
            deleteMany: {},
            create: (body.insights || []).map((i: any) => ({ ...i })),
          },
        },
      })
    : await prisma.workshop.create({
        data: {
          projectId: params.id,
          humanNotes: body.humanNotes,
          insights: { create: (body.insights || []).map((i: any) => ({ ...i })) },
        },
      })

  return NextResponse.json(data, { status: existing ? 200 : 201 })
}
