import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
import { sendNotification } from "@/lib/notifications"
import { runAutoWorkflow } from "@/lib/auto-workflow"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, title, name: inputName, company: inputCompany, phone, type, objective, budget, timeline, context } = body

    if (!email || !title) {
      return NextResponse.json({ error: "Please provide your project title and email." }, { status: 400 })
    }

    // Auto-extract client name & company from email if not provided
    const emailParts = email.split("@")
    const inferredName = inputName || emailParts[0].replace(/[\._-]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
    const domain = emailParts[1] || ""
    const domainCompany = domain ? domain.split(".")[0].replace(/[\._-]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : ""
    const inferredCompany = inputCompany || (domainCompany && !["gmail", "yahoo", "hotmail", "outlook", "icloud"].includes(domainCompany.toLowerCase()) ? domainCompany : "Private Client")

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`

    const existingClient = await prisma.client.findFirst({ where: { email } })
    const client = existingClient || await prisma.client.create({
      data: {
        name: inferredName,
        company: inferredCompany,
        email,
        phone: phone || "",
        industry: "Auto-Enriched",
        status: "lead",
        source: "Micro-Spark Intake",
        tags: ["micro-spark"],
      },
    })

    const owner = await prisma.user.findFirst({
      where: { role: { in: ["producer", "account_manager", "lead", "admin"] } },
      orderBy: { createdAt: "asc" },
    })

    const project = await prisma.project.create({
      data: {
        name: title,
        client: inferredName,
        clientId: client.id,
        type: type || "Brand & Campaign",
        slug,
        stage: "brief",
        progress: 0,
        status: "active",
        nextAction: "AI is enriching project intelligence",
        ownerId: owner?.id,
      },
    })

    const prompt = `You are a high-level agency AI. A client submitted a project micro-spark request:
Email: ${email}
Inferred Company: ${inferredCompany}
Project Title/Goal: ${title}
Context: ${context || "N/A"}

Please perform instant AI background auto-enrichment and infer the following:
1. "industry": (e.g. FinTech, E-commerce, Media)
2. "targetAudience": (e.g. Gen Z, Business Professionals, SMEs)
3. "brandTone": (e.g. Modern, Minimalist, Premium)
4. "aiWants": [3 key wants]
5. "aiObjectives": [3 strategic objectives]
6. "aiRequirements": [3 technical or design requirements]
7. "suggestedDeliverables": [3 key deliverables]
8. "estimatedScope": (e.g. 4-6 weeks)

Return ONLY a JSON object (no markdown, no code fences):
{
  "industry": "...",
  "targetAudience": "...",
  "brandTone": "...",
  "aiWants": ["..."],
  "aiObjectives": ["..."],
  "aiRequirements": ["..."],
  "suggestedDeliverables": ["..."],
  "estimatedScope": "..."
}`

    let enriched = {
      industry: "Technology",
      targetAudience: "General Consumers & Digital Users",
      brandTone: "Modern & Minimalist",
      aiWants: ["Fast execution", "High-converting design", "Scalable architecture"],
      aiObjectives: ["Validate project scope", "Prepare discovery call", "Deliver proposal"],
      aiRequirements: ["Modern UI", "Clean branding", "Responsive layout"],
      suggestedDeliverables: ["Brand Guide", "Interactive Prototype", "Technical Deck"],
      estimatedScope: "4-6 weeks",
    }

    try {
      const raw = await generateWithGemini(prompt)
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      enriched = { ...enriched, ...parsed }
    } catch (e) {
      console.warn("Gemini enrichment fallback used:", e)
    }

    // Update Client industry if auto-enriched
    if (client.industry === "Auto-Enriched") {
      await prisma.client.update({
        where: { id: client.id },
        data: { industry: enriched.industry },
      })
    }

    await prisma.brief.create({
      data: {
        projectId: project.id,
        clientName: inferredName,
        company: inferredCompany,
        contact: email,
        industry: enriched.industry,
        title,
        businessObjective: objective || `Execute ${title}`,
        objectives: enriched.aiObjectives,
        audience: enriched.targetAudience || "Core Target Audience",
        brand: enriched.brandTone || "Modern & Minimalist",
        direction: enriched.brandTone || "Clean & Considered",
        deliverables: enriched.suggestedDeliverables,
        budget: budget || "Custom Scope",
        timeline: timeline || enriched.estimatedScope,
        context: context || "",
        aiWants: enriched.aiWants,
        aiObjectives: enriched.aiObjectives,
        aiRequirements: enriched.aiRequirements,
        aiConfidence: 85,
      },
    })

    await prisma.project.update({
      where: { id: project.id },
      data: {
        nextAction: "AI auto-enrichment complete. Automation engine started.",
        aiActivity: 1,
      },
    })

    if (owner?.id) {
      await sendNotification({
        userId: owner.id,
        title: "Micro-Spark Project Created + AI Enriched",
        message: `AI enriched "${title}" from ${inferredName} (${inferredCompany}). Workflow is executing.`,
        kind: "system",
        refId: project.id,
      })
    }

    runAutoWorkflow(project.id).catch((err) => console.error("Auto-workflow failed:", err))

    return NextResponse.json({
      success: true,
      projectId: project.id,
      clientId: client.id,
      enrichedData: enriched,
    }, { status: 201 })
  } catch (error) {
    console.error("Intake error:", error)
    return NextResponse.json({ error: "Failed to process micro-intake" }, { status: 500 })
  }
}
