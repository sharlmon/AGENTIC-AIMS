export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { publicToken: params.token },
      include: {
        brief: true,
        call: true,
        projectBrief: true,
        proposal: true,
        quote: true,
        clientRef: true,
        conversations: {
          include: {
            messages: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const lastConversation = project.conversations?.[0]
    const messages = (lastConversation?.messages || []).map((m) => ({
      id: m.id,
      senderName: m.senderName,
      senderRole: m.senderRole,
      subject: m.subject,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    }))

    const brief = project.brief
      ? {
          id: project.brief.id,
          title: project.brief.title,
          clientName: project.brief.clientName,
          company: project.brief.company,
          contact: project.brief.contact,
          industry: project.brief.industry,
          businessObjective: project.brief.businessObjective,
          audience: project.brief.audience,
          brand: project.brief.brand,
          direction: project.brief.direction,
          deliverables: project.brief.deliverables,
          timeline: project.brief.timeline,
        }
      : null

    const call = project.call
      ? {
          id: project.call.id,
          date: project.call.date,
          duration: project.call.duration,
          participants: project.call.participants,
          summary: project.call.summary,
        }
      : null

    const projectBrief = project.projectBrief
      ? {
          id: project.projectBrief.id,
          summary: project.projectBrief.summary,
          businessObjective: project.projectBrief.businessObjective,
          creativeObjective: project.projectBrief.creativeObjective,
          audience: project.projectBrief.audience,
          direction: project.projectBrief.direction,
          deliverables: project.projectBrief.deliverables,
          timeline: project.projectBrief.timeline,
          budget: project.projectBrief.budget,
          successCriteria: project.projectBrief.successCriteria,
        }
      : null

    const proposal = project.proposal
      ? {
          id: project.proposal.id,
          status: project.proposal.status,
          publicToken: project.proposal.publicToken,
          sentToClient: project.proposal.sentToClient,
          overview: project.proposal.overview,
          problem: project.proposal.problem,
          solution: project.proposal.solution,
          scope: project.proposal.scope,
          deliverables: project.proposal.deliverables,
          timeline: project.proposal.timeline,
          investment: project.proposal.investment,
          terms: project.proposal.terms,
        }
      : null

    const quote = project.quote
      ? {
          id: project.quote.id,
          status: project.quote.status,
          publicToken: project.quote.publicToken,
          sentToClient: project.quote.sentToClient,
          services: project.quote.services,
          discount: project.quote.discount,
          tax: project.quote.tax,
          paymentTerms: project.quote.paymentTerms,
        }
      : null

    return NextResponse.json({
      id: project.id,
      name: project.name,
      type: project.type,
      stage: project.stage,
      status: project.status,
      progress: project.progress,
      client: project.client,
      clientRef: project.clientRef
        ? {
            id: project.clientRef.id,
            name: project.clientRef.name,
            company: project.clientRef.company,
            email: project.clientRef.email,
          }
        : null,
      createdAt: project.createdAt.toISOString(),
      brief,
      call,
      projectBrief,
      proposal,
      quote,
      deliverables: project.deliverables || [],
      messages,
    })
  } catch (error) {
    console.error("Failed to fetch public project:", error)
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 })
  }
}
