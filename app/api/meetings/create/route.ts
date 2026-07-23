export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runAutoWorkflow } from "@/lib/auto-workflow"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { projectId, mode, projectName, clientName, company, clientEmail, source, transcript } = body

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    let targetProjectId = projectId

    if (mode === "new" || !projectId) {
      if (!projectName || !clientName) {
        return NextResponse.json({ error: "Project name and client name are required for new project" }, { status: 400 })
      }

      const slug = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`

      const client = await prisma.client.create({
        data: {
          name: clientName,
          company: company || "",
          email: clientEmail || "",
          industry: "Unknown",
          status: "active",
          source: "External meeting",
          tags: ["external-meeting"],
        },
      })

      const owner = await prisma.user.findFirst({
        where: { role: { in: ["producer", "account_manager", "lead", "admin"] } },
        orderBy: { createdAt: "asc" },
      })

      const project = await prisma.project.create({
        data: {
          name: projectName,
          client: clientName,
          clientId: client.id,
          type: "Strategy & Campaign",
          slug,
          stage: "brief",
          progress: 0,
          status: "active",
          nextAction: "Meeting captured. AI is processing.",
          ownerId: owner?.id,
        },
      })

      await prisma.brief.create({
        data: {
          projectId: project.id,
          clientName,
          company: company || "",
          contact: clientEmail || "",
          industry: "Unknown",
          title: projectName,
          businessObjective: "",
          objectives: [],
          audience: "",
          brand: "",
          direction: "",
          deliverables: [],
          budget: "",
          timeline: "",
          attachments: [],
          context: `External meeting captured from ${source || "external"}. Meeting transcript stored in call record.`,
        },
      })

      targetProjectId = project.id
    }

    if (!targetProjectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]
    const roomName = `synthos-${targetProjectId}-${Date.now()}`
    const roomUrl = `https://synthos.daily.co/${roomName}`

    const existing = await prisma.clientCall.findUnique({ where: { projectId: targetProjectId } })

    const call = existing
      ? await prisma.clientCall.update({
          where: { projectId: targetProjectId },
          data: {
            date: existing.date || today,
            duration: existing.duration || "45 minutes",
            participants: existing.participants?.length ? existing.participants : ["Client", "Producer", "Strategist"],
            summary: existing.summary || transcript.substring(0, 200),
            meetingSource: source || existing.meetingSource || "custom",
            transcript,
            roomName: existing.roomName || roomName,
            roomUrl: existing.roomUrl || roomUrl,
          },
        })
      : await prisma.clientCall.create({
          data: {
            projectId: targetProjectId,
            date: today,
            duration: "45 minutes",
            participants: ["Client", "Producer", "Strategist"],
            summary: transcript.substring(0, 200),
            meetingSource: source || "custom",
            transcript,
            roomName,
            roomUrl,
          },
        })

    await runAutoWorkflow(targetProjectId).catch((err) => console.error("Auto-workflow after external meeting:", err))

    return NextResponse.json({ success: true, projectId: targetProjectId, call })
  } catch (error) {
    console.error("External meeting capture error:", error)
    return NextResponse.json({ error: "Failed to capture meeting" }, { status: 500 })
  }
}
