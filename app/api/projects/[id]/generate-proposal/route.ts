import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { brief: true, synthesis: true },
  })
  if (!project || !project.brief) {
    return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
  }

  const b = project.brief
  const s = project.synthesis

  const prompt = `You are a creative intelligence AI. Generate a professional client proposal for a creative project.

Project: ${b.title}
Client: ${b.company}
Industry: ${b.industry}
Business Objective: ${b.businessObjective}
Audience: ${b.audience}
Brand Context: ${b.brand}
Creative Direction: ${b.direction}
Deliverables: ${b.deliverables.join(", ")}
Timeline: ${b.timeline}
Budget: ${b.budget}

${s ? `Synthesis Summary: ${s.executiveSummary}` : ""}
${s ? `Strategic Direction: ${s.strategicDirection}` : ""}
${s ? `Creative Direction: ${s.creativeDirection}` : ""}

Return ONLY a JSON object:
{
  "clientDetails": "...",
  "overview": "...",
  "problem": "...",
  "solution": "...",
  "scope": ["..."],
  "deliverables": ["..."],
  "timeline": "...",
  "team": ["..."],
  "investment": "$XX,XXX",
  "terms": "X% start, X% midpoint, X% on delivery",
  "status": "review",
  "sections": [
    { "title": "Context", "body": "...", "attr": "ai" },
    { "title": "Approach", "body": "...", "attr": "mixed" }
  ]
}`

  const raw = await generateWithGemini(prompt)

  let parsed
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
  }

  const existing = await prisma.proposal.findUnique({ where: { projectId: params.id } })

  const data = existing
    ? await prisma.proposal.update({
        where: { projectId: params.id },
        data: {
          clientDetails: parsed.clientDetails,
          overview: parsed.overview,
          problem: parsed.problem,
          solution: parsed.solution,
          scope: parsed.scope || [],
          deliverables: parsed.deliverables || [],
          timeline: parsed.timeline,
          team: parsed.team || [],
          investment: parsed.investment,
          terms: parsed.terms,
          status: parsed.status || "review",
          sections: parsed.sections || [],
        },
      })
    : await prisma.proposal.create({
        data: {
          projectId: params.id,
          clientDetails: parsed.clientDetails,
          overview: parsed.overview,
          problem: parsed.problem,
          solution: parsed.solution,
          scope: parsed.scope || [],
          deliverables: parsed.deliverables || [],
          timeline: parsed.timeline,
          team: parsed.team || [],
          investment: parsed.investment,
          terms: parsed.terms,
          status: parsed.status || "review",
          sections: parsed.sections || [],
        },
      })

  return NextResponse.json(data)
}
