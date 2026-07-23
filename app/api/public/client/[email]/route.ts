export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { email: string } }) {
  try {
    const decodedEmail = decodeURIComponent(params.email)

    if (!decodedEmail.trim() || !decodedEmail.includes("@")) {
      return NextResponse.json({ projects: [] })
    }

    const client = await prisma.client.findFirst({
      where: { email: decodedEmail },
      include: {
        projects: {
          orderBy: { updatedAt: "desc" },
          include: {
            proposal: true,
            quote: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ projects: [] })
    }

    const projects = client.projects.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      stage: p.stage,
      status: p.status,
      progress: p.progress,
      publicToken: p.publicToken,
      proposal: p.proposal
        ? {
            id: p.proposal.id,
            status: p.proposal.status,
            publicToken: p.proposal.publicToken,
            sentToClient: p.proposal.sentToClient,
          }
        : null,
      quote: p.quote
        ? {
            id: p.quote.id,
            status: p.quote.status,
            publicToken: p.quote.publicToken,
            sentToClient: p.quote.sentToClient,
          }
        : null,
      updatedAt: p.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      projects,
      clientName: client.name,
    })
  } catch (error) {
    console.error("Failed to fetch client projects:", error)
    return NextResponse.json({ projects: [] }, { status: 500 })
  }
}
