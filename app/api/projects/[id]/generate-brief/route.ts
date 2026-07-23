import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { brief: true },
  })

  if (!project || !project.brief) {
    return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
  }

  const b = project.brief

  const prompt = `You are a creative intelligence AI. Analyze this creative brief and extract structured insights.

Client: ${b.company}
Industry: ${b.industry}
Project Title: ${b.title}
Business Objective: ${b.businessObjective}
Objectives: ${b.objectives.join("; ")}
Target Audience: ${b.audience}
Brand Context: ${b.brand}
Creative Direction: ${b.direction}
Deliverables: ${b.deliverables.join("; ")}
Budget: ${b.budget}
Timeline: ${b.timeline}
Additional Context: ${b.context}

Return ONLY a JSON object (no markdown, no code fences):
{
  "aiWants": ["..."],
  "aiObjectives": ["..."],
  "aiRequirements": ["..."],
  "aiRisks": ["..."],
  "aiMissing": ["..."],
  "aiQuestions": ["..."],
  "aiConfidence": 85
}

Confidence should be 0-100 based on how complete and clear the brief is.`

  const raw = await generateWithGemini(prompt)

  let parsed
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
  }

  const updated = await prisma.brief.update({
    where: { projectId: params.id },
    data: {
      aiWants: parsed.aiWants || [],
      aiObjectives: parsed.aiObjectives || [],
      aiRequirements: parsed.aiRequirements || [],
      aiRisks: parsed.aiRisks || [],
      aiMissing: parsed.aiMissing || [],
      aiQuestions: parsed.aiQuestions || [],
      aiConfidence: parsed.aiConfidence || 0,
    },
  })

  return NextResponse.json(updated)
}
