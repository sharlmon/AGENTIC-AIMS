import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { brief: true, call: true, transcript: true },
  })
  if (!project || !project.brief) {
    return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
  }

  const b = project.brief
  const prompt = `You are a creative intelligence AI. Generate structured understanding for a creative project.

Project: ${b.title}
Client: ${b.company}
Industry: ${b.industry}
Business Objective: ${b.businessObjective}
Audience: ${b.audience}
Brand: ${b.brand}
Direction: ${b.direction}
Context: ${b.context}

${project.call ? `Discovery Call Summary: ${project.call.summary}` : ""}
  ${project.transcript ? `Transcript: ${Array.isArray(project.transcript.lines) ? (project.transcript.lines as any[]).map((l: any) => l.text).join(" ") : ""}` : ""}

Return ONLY a JSON object with this exact structure:
{
  "confidence": 75,
  "insights": [
    { "group": "wants", "text": "...", "attr": "ai", "status": "draft" },
    { "group": "businessObjectives", "text": "...", "attr": "ai", "status": "draft" },
    { "group": "creativeObjectives", "text": "...", "attr": "ai", "status": "draft" },
    { "group": "constraints", "text": "...", "attr": "ai", "status": "draft" },
    { "group": "risks", "text": "...", "attr": "ai", "status": "draft" },
    { "group": "missing", "text": "...", "attr": "ai", "status": "draft" },
    { "group": "questions", "text": "...", "attr": "ai", "status": "draft" }
  ]
}

Generate 3-5 insights per group. Make them specific and actionable.`

  const raw = await generateWithGemini(prompt)

  let parsed
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
  }

  const insightData = ((parsed.insights || []) as any[]).map((i: any) => ({
    group: i.group,
    text: i.text,
    attr: i.attr || "ai",
    status: i.status || "draft",
  }))

  const existing = await prisma.understanding.findUnique({ where: { projectId: params.id } })

  const data = existing
    ? await prisma.understanding.update({
        where: { projectId: params.id },
        data: {
          confidence: parsed.confidence || 70,
          insights: { deleteMany: {}, create: insightData },
        },
      })
    : await prisma.understanding.create({
        data: {
          projectId: params.id,
          confidence: parsed.confidence || 70,
          insights: { create: insightData },
        },
      })

  return NextResponse.json(data)
}
