import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const call = await prisma.clientCall.findUnique({ where: { projectId: params.id } })
  return NextResponse.json(call)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const existing = await prisma.clientCall.findUnique({ where: { projectId: params.id } })
  const call = existing
    ? await prisma.clientCall.update({ where: { projectId: params.id }, data: body })
    : await prisma.clientCall.create({ data: { ...body, projectId: params.id } })

  if (!existing) {
    const project = await prisma.project.findUnique({ where: { id: params.id } })
    if (project?.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: "First meeting scheduled",
        message: `The first meeting for "${project.name}" has been scheduled.`,
        kind: "info",
        refId: params.id,
      })
    }
  }

  return NextResponse.json(call, { status: existing ? 200 : 201 })
}
