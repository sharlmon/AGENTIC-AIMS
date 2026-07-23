export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification, notifyAdmins } from "@/lib/notifications"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  const report = await prisma.contactReport.upsert({
    where: { projectId: params.id },
    update: {
      summary: body.summary || "",
      keyPoints: body.keyPoints || [],
      decisions: body.decisions || [],
      actionItems: body.actionItems || [],
      nextSteps: body.nextSteps || [],
      approved: body.approved || false,
      sentToClient: body.sentToClient || false,
    },
    create: {
      projectId: params.id,
      summary: body.summary || "",
      keyPoints: body.keyPoints || [],
      decisions: body.decisions || [],
      actionItems: body.actionItems || [],
      nextSteps: body.nextSteps || [],
      approved: body.approved || false,
      sentToClient: body.sentToClient || false,
    },
  })

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (project?.ownerId) {
    await sendNotification({
      userId: project.ownerId,
      title: "Contact report ready",
      message: `A contact report has been generated for "${project.name}". Please review and confirm.`,
      kind: "approval",
      refId: params.id,
    })
  }

  if (body.approved) {
    await notifyAdmins({
      title: "Contact report approved",
      message: `The client approved the contact report for "${project?.name}". You can now schedule the production meeting.`,
      kind: "info",
      refId: params.id,
    })
  }

  return NextResponse.json(report)
}
