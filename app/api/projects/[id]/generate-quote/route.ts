import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { proposal: true, brief: true },
  })
  if (!project || !project.proposal) {
    return NextResponse.json({ error: "Project or proposal not found" }, { status: 404 })
  }

  const p = project.proposal
  const b = project.brief

  const prompt = `You are a creative intelligence AI. Generate a professional quote for a creative project.

Project: ${b?.title || p.clientDetails}
Client: ${p.clientDetails}
Proposal Overview: ${p.overview}
Scope: ${p.scope?.join(", ") || ""}
Deliverables: ${p.deliverables?.join(", ") || ""}
Timeline: ${p.timeline}
Investment: ${p.investment}
Terms: ${p.terms}

Return ONLY a JSON object:
{
  "services": [
    { "name": "...", "desc": "...", "qty": 1, "rate": 15000 }
  ],
  "discount": 0,
  "tax": 0,
  "paymentTerms": "40 / 40 / 20",
  "status": "review"
}

Create 3-5 service lines based on the deliverables. Distribute the total investment ($${p.investment?.replace(/[^0-9]/g, "") || "85000"}) across the services as rates.`

  const raw = await generateWithGemini(prompt)

  let parsed
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
  }

  const existing = await prisma.quote.findUnique({ where: { projectId: params.id } })

  const data = existing
    ? await prisma.quote.update({
        where: { projectId: params.id },
        data: {
          services: parsed.services || [],
          discount: parsed.discount || 0,
          tax: parsed.tax || 0,
          paymentTerms: parsed.paymentTerms || "40 / 40 / 20",
          status: parsed.status || "review",
        },
      })
    : await prisma.quote.create({
        data: {
          projectId: params.id,
          services: parsed.services || [],
          discount: parsed.discount || 0,
          tax: parsed.tax || 0,
          paymentTerms: parsed.paymentTerms || "40 / 40 / 20",
          status: parsed.status || "review",
        },
      })

  return NextResponse.json(data)
}
