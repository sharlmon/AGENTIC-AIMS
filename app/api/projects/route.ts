export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Stage, ProjStatus, ReviewStatus } from "@prisma/client"
import { runAutoWorkflow } from "@/lib/auto-workflow"

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { brief: true, understanding: true, workshop: true, proposal: true, quote: true },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const project = await prisma.project.create({
      data: {
        name: body.name,
        client: body.client,
        type: body.type || "Strategy & Campaign",
        stage: body.stage ? (body.stage as Stage) : Stage.brief,
        progress: body.progress ?? 0,
        status: body.status ? (body.status as ProjStatus) : ProjStatus.active,
        nextAction: body.nextAction || "Complete the creative brief",
        slug: (body.name || "Untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40),
        clientId: body.clientId || undefined,
      },
    })

    const client = body.clientId
      ? await prisma.client.findUnique({ where: { id: body.clientId } })
      : await prisma.client.findFirst({ where: { name: body.client } })

    if (!client) {
      await prisma.client.create({
        data: {
          name: body.client || "Unknown",
          company: body.company || "",
          email: body.email || "",
          industry: "Unknown",
          status: "lead",
          source: "Admin",
          tags: ["admin-created"],
        },
      })
    }

    await prisma.brief.create({
      data: {
        projectId: project.id,
        clientName: body.client || "",
        company: body.company || "",
        contact: body.email || "",
        industry: "Unknown",
        title: body.name || "",
        businessObjective: body.objective || "",
        objectives: [],
        audience: body.audience || "",
        brand: "",
        direction: body.direction || "",
        deliverables: [],
        budget: body.budget || "",
        timeline: body.timeline || "",
        attachments: [],
        context: body.context || "",
      },
    })

    runAutoWorkflow(project.id).catch((err) => console.error("Auto-workflow failed after project creation:", err))

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
