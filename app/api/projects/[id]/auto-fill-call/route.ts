import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
import { sendNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { callScheduledEmail } from "@/lib/email-templates"
import { runAutoWorkflow } from "@/lib/auto-workflow"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { brief: true, clientRef: true },
    })

    if (!project || !project.brief) {
      return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
    }

    const b = project.brief
    const today = new Date().toISOString().split("T")[0]

    const prompt = `You are a creative intelligence AI. Generate a realistic discovery call plan based on the project brief.

Client: ${b.clientName || project.client}
Company: ${b.company || "N/A"}
Industry: ${b.industry || "Unknown"}
Project: ${b.title || project.name}
Business Objective: ${b.businessObjective || "N/A"}
Audience: ${b.audience || "N/A"}
Creative Direction: ${b.direction || "N/A"}
Budget: ${b.budget || "N/A"}
Timeline: ${b.timeline || "N/A"}

Return ONLY a JSON object:
{
  "participants": ["Producer", "Strategist", "Client"],
  "summary": "A concise 1-2 sentence description of the meeting purpose."
}`

    const raw = await generateWithGemini(prompt)
    let parsed
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
    }

    const participants = Array.isArray(parsed.participants) ? parsed.participants : ["Producer", "Strategist", project.client]
    const summary = parsed.summary || `Discovery call for ${project.name}`

    const roomName = `synthos-${params.id}-${Date.now()}`
    const roomUrl = `https://synthos.daily.co/${roomName}`

    const existing = await prisma.clientCall.findUnique({ where: { projectId: params.id } })

    const call = existing
      ? await prisma.clientCall.update({
          where: { projectId: params.id },
          data: {
            date: existing.date || today,
            duration: existing.duration || "45 minutes",
            participants: existing.participants?.length ? existing.participants : participants,
            summary: existing.summary || summary,
            meetingSource: existing.meetingSource || "embedded",
            roomName: existing.roomName || roomName,
            roomUrl: existing.roomUrl || roomUrl,
          },
        })
      : await prisma.clientCall.create({
          data: {
            projectId: params.id,
            date: today,
            duration: "45 minutes",
            participants,
            summary,
            meetingSource: "embedded",
            roomName,
            roomUrl,
          },
        })

    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: "Discovery call scheduled",
        message: `A discovery call has been scheduled for "${project.name}". Join here: ${roomUrl}`,
        kind: "info",
        refId: project.id,
      })
    }

    if (project.clientRef?.email) {
      await sendEmail({
        to: project.clientRef.email,
        subject: `Discovery call scheduled: ${project.name}`,
        html: callScheduledEmail({ clientName: project.clientRef.name || project.client, projectName: project.name, dailyUrl: roomUrl }),
      })
    }

    await runAutoWorkflow(params.id).catch((err) => console.error("Auto-workflow after auto-fill-call:", err))

    return NextResponse.json(call)
  } catch (error) {
    console.error("Auto-fill call error:", error)
    return NextResponse.json({ error: "Failed to auto-fill call" }, { status: 500 })
  }
}
