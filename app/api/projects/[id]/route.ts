export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Stage, ProjStatus } from "@prisma/client"
import { sendNotification } from "@/lib/notifications"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      brief: true, call: true, transcript: true,
      understanding: { include: { insights: { orderBy: { createdAt: "asc" } } } },
      projectBrief: true,
      workshop: { include: { insights: { orderBy: { createdAt: "asc" } } } },
      synthesis: true, proposal: true, quote: true,
      approvals: { orderBy: { createdAt: "desc" } },
      contactReport: true,
      productionMeeting: true,
    },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json({ error: "Failed to remove project" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: any = { ...body }

  if (body.stage) data.stage = body.stage as Stage
  if (body.status) data.status = body.status as ProjStatus

  if (body.proposal?.status) {
    await prisma.proposal.update({ where: { projectId: params.id }, data: { status: body.proposal.status as any } })
    delete data.proposal
  }
  if (body.quote?.status) {
    await prisma.quote.update({ where: { projectId: params.id }, data: { status: body.quote.status as any } })
    delete data.quote
  }
  if (body.approvalId && body.approvalStatus) {
    await prisma.approval.update({ where: { id: body.approvalId }, data: { status: body.approvalStatus as any, decidedBy: "human" } })
    delete data.approvalId
    delete data.approvalStatus
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (body.email || body.company) {
    const client = await prisma.client.findFirst({ where: { name: project.client } })
    if (client) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          ...(body.email ? { email: body.email } : {}),
          ...(body.company ? { company: body.company } : {}),
        },
      })
    }
    delete data.email
    delete data.company
  }

  const updated = await prisma.project.update({ where: { id: params.id }, data })
  
  if (body.stage && updated.ownerId) {
    const stageLabels: Record<string, string> = {
      brief: "Brief",
      call: "First Meeting",
      contactReport: "Contact Report",
      productionMeeting: "Production Meeting",
      proposal: "Proposal",
      quote: "Quote",
      approval: "Approval",
    }
    await sendNotification({
      userId: updated.ownerId,
      title: `Stage advanced: ${stageLabels[body.stage] || body.stage}`,
      message: `The project "${updated.name}" has moved to the ${stageLabels[body.stage] || body.stage} stage.`,
      kind: "info",
      refId: params.id,
    })
  }

  return NextResponse.json(updated)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  if (body.stage) {
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { stage: body.stage as Stage },
    })

    if (updated.ownerId) {
      const stageLabels: Record<string, string> = {
        brief: "Brief",
        call: "First Meeting",
        contactReport: "Contact Report",
        productionMeeting: "Production Meeting",
        proposal: "Proposal",
        quote: "Quote",
        approval: "Approval",
      }
      await sendNotification({
        userId: updated.ownerId,
        title: `Stage advanced: ${stageLabels[body.stage] || body.stage}`,
        message: `The project "${updated.name}" has moved to the ${stageLabels[body.stage] || body.stage} stage.`,
        kind: "info",
        refId: params.id,
      })
    }

    return NextResponse.json(updated)
  }
  return NextResponse.json({ error: "Unsupported" }, { status: 400 })
}
