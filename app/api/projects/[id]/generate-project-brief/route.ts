import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { brief: true, understanding: { include: { insights: true } } },
  })
  if (!project || !project.brief) {
    return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
  }

  const b = project.brief
  const u = project.understanding
  const wants = (u?.insights || []).filter((i) => i.group === "wants")
  const objectives = (u?.insights || []).filter((i) => i.group === "businessObjectives")
  const risks = (u?.insights || []).filter((i) => i.group === "risks")
  const missing = (u?.insights || []).filter((i) => i.group === "missing")

  const prompt = `You are a creative intelligence AI. Generate a structured project brief.

Project: ${b.title}
Client: ${b.company}
Business Objective: ${b.businessObjective}
Audience: ${b.audience}
Brand Context: ${b.brand}
Direction: ${b.direction}
Deliverables: ${b.deliverables.join(", ")}
Timeline: ${b.timeline}
Budget: ${b.budget}

${wants.length > 0 ? `Client Wants: ${wants.map(w => w.text).join("; ")}` : ""}
${objectives.length > 0 ? `Objectives: ${objectives.map(o => o.text).join("; ")}` : ""}
${risks.length > 0 ? `Risks: ${risks.map(r => r.text).join("; ")}` : ""}
${missing.length > 0 ? `Missing Info: ${missing.map(m => m.text).join("; ")}` : ""}

Return ONLY a JSON object:
{
  "summary": "...",
  "businessObjective": "...",
  "creativeObjective": "...",
  "audience": "...",
  "direction": "...",
  "deliverables": ["..."],
  "timeline": "...",
  "budget": "...",
  "risks": ["..."],
  "openQuestions": ["..."],
  "successCriteria": ["..."]
}`

  const raw = await generateWithGemini(prompt)

  let parsed
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
  }

  const existing = await prisma.projectBrief.findUnique({ where: { projectId: params.id } })

  const data = existing
    ? await prisma.projectBrief.update({
        where: { projectId: params.id },
        data: {
          summary: parsed.summary,
          businessObjective: parsed.businessObjective,
          creativeObjective: parsed.creativeObjective,
          audience: parsed.audience,
          direction: parsed.direction,
          deliverables: parsed.deliverables || [],
          timeline: parsed.timeline,
          budget: parsed.budget,
          risks: parsed.risks || [],
          openQuestions: parsed.openQuestions || [],
          successCriteria: parsed.successCriteria || [],
        },
      })
    : await prisma.projectBrief.create({
        data: {
          projectId: params.id,
          summary: parsed.summary,
          businessObjective: parsed.businessObjective,
          creativeObjective: parsed.creativeObjective,
          audience: parsed.audience,
          direction: parsed.direction,
          deliverables: parsed.deliverables || [],
          timeline: parsed.timeline,
          budget: parsed.budget,
          risks: parsed.risks || [],
          openQuestions: parsed.openQuestions || [],
          successCriteria: parsed.successCriteria || [],
        },
      })

  return NextResponse.json(data)
}
