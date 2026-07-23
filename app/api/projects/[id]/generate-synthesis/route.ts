import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { brief: true, projectBrief: true, workshop: { include: { insights: true } } },
  })
  if (!project || !project.brief) {
    return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
  }

  const b = project.brief
  const pb = project.projectBrief
  const w = project.workshop
  const directions = (w?.insights || []).filter((i) => i.group === "directions")
  const challenges = (w?.insights || []).filter((i) => i.group === "challenges")
  const opportunities = (w?.insights || []).filter((i) => i.group === "opportunities")

  const prompt = `You are a creative intelligence AI. Generate a strategic synthesis for a creative project.

Project: ${b.title}
Client: ${b.company}
Business Objective: ${b.businessObjective}
Creative Direction: ${b.direction}
Deliverables: ${b.deliverables.join(", ")}
Timeline: ${b.timeline}

${pb ? `Project Brief Summary: ${pb.summary}` : ""}
${directions.length > 0 ? `Directions: ${directions.map(d => d.text).join("; ")}` : ""}
${challenges.length > 0 ? `Challenges: ${challenges.map(c => c.text).join("; ")}` : ""}
${opportunities.length > 0 ? `Opportunities: ${opportunities.map(o => o.text).join("; ")}` : ""}

Return ONLY a JSON object:
{
  "executiveSummary": "...",
  "strategicDirection": "...",
  "creativeDirection": "...",
  "approach": "...",
  "deliverables": ["..."],
  "timeline": "...",
  "risks": ["..."],
  "openQuestions": ["..."],
  "decisions": ["..."]
}`

  const raw = await generateWithGemini(prompt)

  let parsed
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
  }

  const existing = await prisma.synthesis.findUnique({ where: { projectId: params.id } })

  const data = existing
    ? await prisma.synthesis.update({
        where: { projectId: params.id },
        data: {
          executiveSummary: parsed.executiveSummary,
          strategicDirection: parsed.strategicDirection,
          creativeDirection: parsed.creativeDirection,
          approach: parsed.approach,
          deliverables: parsed.deliverables || b.deliverables,
          timeline: parsed.timeline,
          risks: parsed.risks || [],
          openQuestions: parsed.openQuestions || [],
          decisions: parsed.decisions || [],
        },
      })
    : await prisma.synthesis.create({
        data: {
          projectId: params.id,
          executiveSummary: parsed.executiveSummary,
          strategicDirection: parsed.strategicDirection,
          creativeDirection: parsed.creativeDirection,
          approach: parsed.approach,
          deliverables: parsed.deliverables || b.deliverables,
          timeline: parsed.timeline,
          risks: parsed.risks || [],
          openQuestions: parsed.openQuestions || [],
          decisions: parsed.decisions || [],
        },
      })

  return NextResponse.json(data)
}
