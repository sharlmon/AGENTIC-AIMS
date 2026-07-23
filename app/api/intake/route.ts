import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
import { sendNotification } from "@/lib/notifications"
import { runAutoWorkflow } from "@/lib/auto-workflow"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, company, email, phone, type, title, objective, audience, direction, budget, timeline, context } = body

    if (!name || !email || !title) {
      return NextResponse.json({ error: "Name, email, and project title are required." }, { status: 400 })
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`

    const existingClient = await prisma.client.findFirst({ where: { email } })
    const client = existingClient || await prisma.client.create({
      data: {
        name,
        company: company || "",
        email,
        phone: phone || "",
        industry: "Unknown",
        status: "lead",
        source: "Intake form",
        tags: ["intake"],
      },
    })

    const owner = await prisma.user.findFirst({
      where: { role: { in: ["producer", "account_manager", "lead", "admin"] } },
      orderBy: { createdAt: "asc" },
    })

    const project = await prisma.project.create({
      data: {
        name: title,
        client: name,
        clientId: client.id,
        type: type || "Brand & Campaign",
        slug,
        stage: "brief",
        progress: 0,
        status: "active",
        nextAction: "AI is analyzing the brief",
        ownerId: owner?.id,
      },
    })

    const briefData: any = {
      projectId: project.id,
      clientName: name,
      company: company || client.company || "",
      contact: email,
      industry: client.industry || "Unknown",
      title,
      businessObjective: objective || "",
      objectives: [],
      audience: audience || "",
      brand: "",
      direction: direction || "",
      deliverables: [],
      budget: budget || "",
      timeline: timeline || "",
      attachments: [],
      context: context || "",
    }

    const brief = await prisma.brief.create({ data: briefData })

    const prompt = `You are a creative intelligence AI. Analyze this client intake form and extract structured insights.

Client: ${name}
Company: ${company || client.company || "N/A"}
Industry: ${client.industry || "Unknown"}
Project Title: ${title}
Business Objective: ${objective || "N/A"}
Audience: ${audience || "N/A"}
Creative Direction: ${direction || "N/A"}
Budget: ${budget || "N/A"}
Timeline: ${timeline || "N/A"}
Context: ${context || "N/A"}

Return ONLY a JSON object (no markdown, no code fences):
{
  "aiWants": ["..."],
  "aiObjectives": ["..."],
  "aiRequirements": ["..."],
  "aiRisks": ["..."],
  "aiMissing": ["..."],
  "aiQuestions": ["..."],
  "aiConfidence": 70
}`

    const raw = await generateWithGemini(prompt)
    let parsed
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {
        aiWants: ["Understand client goals", "Define target audience", "Establish creative direction"],
        aiObjectives: ["Complete project brief", "Schedule discovery call", "Align on deliverables"],
        aiRequirements: ["Clear objectives", "Defined timeline", "Budget alignment"],
        aiRisks: ["Unclear scope", "Timeline constraints"],
        aiMissing: ["Specific KPIs", "Competitive landscape"],
        aiQuestions: ["What are success metrics?", "Any legacy assets?"],
        aiConfidence: 60,
      }
    }

    await prisma.brief.update({
      where: { id: brief.id },
      data: {
        aiWants: parsed.aiWants || [],
        aiObjectives: parsed.aiObjectives || [],
        aiRequirements: parsed.aiRequirements || [],
        aiRisks: parsed.aiRisks || [],
        aiMissing: parsed.aiMissing || [],
        aiQuestions: parsed.aiQuestions || [],
        aiConfidence: parsed.aiConfidence || 60,
      },
    })

    await prisma.project.update({
      where: { id: project.id },
      data: {
        nextAction: "AI brief analysis complete. Ready for discovery call.",
        aiActivity: 1,
      },
    })

    if (owner?.id) {
      await sendNotification({
        userId: owner.id,
        title: "New project + AI workflow started",
        message: `AI is now processing "${title}" from ${name}. It will generate the call, contact report, proposal, and quote automatically.`,
        kind: "system",
        refId: project.id,
      })
    }

    runAutoWorkflow(project.id).catch((err) => console.error("Auto-workflow failed:", err))

    return NextResponse.json({ success: true, projectId: project.id, clientId: client.id }, { status: 201 })
  } catch (error) {
    console.error("Intake error:", error)
    return NextResponse.json({ error: "Failed to process intake" }, { status: 500 })
  }
}
