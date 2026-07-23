import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const p = await prisma.proposal.findUnique({ where: { projectId: params.id } })
  return NextResponse.json(p)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  
  if (body.action === "sendToClient") {
    const p = await prisma.proposal.findUnique({ where: { projectId: params.id } })
    if (!p) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    
    const publicToken = crypto.randomUUID()
    const updated = await prisma.proposal.update({
      where: { projectId: params.id },
      data: { publicToken, sentToClient: true, sentAt: new Date() },
    })
    
    const project = await prisma.project.findUnique({ where: { id: params.id } })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const publicUrl = `${baseUrl}/public/approve/${publicToken}`
    
    return NextResponse.json({ ...updated, publicUrl })
  }

  const existing = await prisma.proposal.findUnique({ where: { projectId: params.id } })
  const p = existing
    ? await prisma.proposal.update({ where: { projectId: params.id }, data: body })
    : await prisma.proposal.create({ data: { ...body, projectId: params.id } })

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (project?.ownerId) {
    await sendNotification({
      userId: project.ownerId,
      title: "Proposal ready",
      message: `A proposal has been drafted for "${project.name}". Please review.`,
      kind: "approval",
      refId: params.id,
    })
  }

  return NextResponse.json(p, { status: existing ? 200 : 201 })
}
