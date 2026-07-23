import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const q = await prisma.quote.findUnique({ where: { projectId: params.id } })
  return NextResponse.json(q)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  
  if (body.action === "sendToClient") {
    const q = await prisma.quote.findUnique({ where: { projectId: params.id } })
    if (!q) return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    
    const publicToken = crypto.randomUUID()
    const updated = await prisma.quote.update({
      where: { projectId: params.id },
      data: { publicToken, sentToClient: true, sentAt: new Date() },
    })
    
    const project = await prisma.project.findUnique({ where: { id: params.id } })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const publicUrl = `${baseUrl}/public/approve/${publicToken}`
    
    return NextResponse.json({ ...updated, publicUrl })
  }

  if (body.action === "convertFromProposal") {
    const proposal = await prisma.proposal.findUnique({ where: { projectId: params.id } })
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    
    const investmentNum = parseInt(proposal.investment.replace(/[^0-9]/g, "")) || 85000
    const serviceCount = Math.max(3, Math.min(5, (proposal.scope?.length || 3)))
    const perService = Math.round(investmentNum / serviceCount)
    
    const services = proposal.scope?.slice(0, serviceCount).map((s: string, i: number) => ({
      name: s,
      desc: proposal.deliverables?.[i] || "",
      qty: 1,
      rate: i === serviceCount - 1 ? investmentNum - perService * (serviceCount - 1) : perService,
    })) || []
    
    const q = await prisma.quote.upsert({
      where: { projectId: params.id },
      update: {
        services,
        paymentTerms: proposal.terms || "40 / 40 / 20",
        status: "review",
      },
      create: {
        projectId: params.id,
        services,
        paymentTerms: proposal.terms || "40 / 40 / 20",
        status: "review",
      },
    })
    
    await prisma.project.update({
      where: { id: params.id },
      data: { stage: "quote" },
    })
    
    return NextResponse.json(q)
  }

  const existing = await prisma.quote.findUnique({ where: { projectId: params.id } })
  const q = existing
    ? await prisma.quote.update({ where: { projectId: params.id }, data: body })
    : await prisma.quote.create({ data: { ...body, projectId: params.id } })

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (project?.ownerId) {
    await sendNotification({
      userId: project.ownerId,
      title: "Quote ready",
      message: `A quote has been prepared for "${project.name}". Please review and accept.`,
      kind: "approval",
      refId: params.id,
    })
  }

  return NextResponse.json(q, { status: existing ? 200 : 201 })
}
