export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification, notifyAdmins } from "@/lib/notifications"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  const meeting = await prisma.productionMeeting.upsert({
    where: { projectId: params.id },
    update: {
      decision: body.decision,
      notes: body.notes || "",
    },
    create: {
      projectId: params.id,
      decision: body.decision,
      notes: body.notes || "",
    },
  })

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (project?.ownerId) {
    await sendNotification({
      userId: project.ownerId,
      title: `Production meeting ${body.decision}`,
      message: `You ${body.decision} the production meeting for "${project.name}".`,
      kind: body.decision === "approved" ? "info" : "approval",
      refId: params.id,
    })
  }

  await notifyAdmins({
    title: `Production meeting ${body.decision}`,
    message: `The client ${body.decision} the production meeting for "${project?.name}".`,
    kind: body.decision === "approved" ? "info" : "approval",
    refId: params.id,
  })

  return NextResponse.json(meeting)
}
