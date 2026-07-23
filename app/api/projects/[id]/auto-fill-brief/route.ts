import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
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

    const prompt = `You are a creative intelligence AI. Enrich a creative brief that has only partial information filled in by the client.

Existing brief data:
- Client: ${b.clientName || project.client}
- Company: ${b.company || "N/A"}
- Industry: ${b.industry || "Unknown"}
- Project Title: ${b.title || project.name}
- Business Objective: ${b.businessObjective || "N/A"}
- Reported Objectives: ${b.objectives?.length ? b.objectives.join("; ") : "None provided"}
- Target Audience: ${b.audience || "N/A"}
- Reported Creative Direction: ${b.direction || "None provided"}
- Reported Budget: ${b.budget || "N/A"}
- Reported Timeline: ${b.timeline || "N/A"}
- Additional Context: ${b.context || "None provided"}

Based on the business objective and industry, fill in ALL missing or weak fields. Be specific and professional.

Return ONLY a JSON object (no markdown, no code fences):
{
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "brand": "Relevant brand context or N/A if not inferable",
  "direction": "Specific creative direction recommendation",
  "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3"],
  "context": "Expanded context with strategic framing"
}`

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
        objectives: Array.isArray(parsed.objectives) ? parsed.objectives : b.objectives || [],
        brand: parsed.brand || b.brand || "",
        direction: parsed.direction || b.direction || "",
        deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : b.deliverables || [],
        context: parsed.context || b.context || "",
      },
    })

    await runAutoWorkflow(params.id).catch((err) => console.error("Auto-workflow after auto-fill-brief:", err))

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Auto-fill brief error:", error)
    return NextResponse.json({ error: "Failed to auto-fill brief" }, { status: 500 })
  }
}
