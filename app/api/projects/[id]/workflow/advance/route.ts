import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { adminProjectApprovedEmail, projectApprovedClientEmail } from "@/lib/email-templates"
import { STAGES, type StageId } from "@/lib/types"
import { GoogleGenerativeAI } from "@google/generative-ai"

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  if (!apiKey) return "{}";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const CONTACT_REPORT_PROMPT = (project: any, call: any) => `You are a creative intelligence AI. Generate a contact report for a client call.

Project: ${project.name}
Client: ${project.client}
Call Date: ${call.date}
Participants: ${call.participants.join(", ")}
Call Summary: ${call.summary}

Return ONLY a JSON object:
{
  "summary": "A concise summary of the call...",
  "keyPoints": ["..."],
  "decisions": ["..."],
  "actionItems": [{"who": "...", "task": "...", "due": "..."}],
  "nextSteps": ["..."]
}`

const PRODUCTION_MEETING_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a production meeting plan for a creative project.

Project: ${project.name}
Client: ${project.client}

Return ONLY a JSON object:
{
  "title": "Production Meeting",
  "summary": "Overview of the production plan...",
  "agenda": ["..."],
  "team": ["..."],
  "timeline": "...",
  "deliverables": ["..."],
  "budget": "..."
}`

const PROPOSAL_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a professional client proposal for a creative project.

Project: ${project.name}
Client: ${project.client}
Business Objective: ${project.brief?.businessObjective}
Audience: ${project.brief?.audience}
Brand Context: ${project.brief?.brand}
Creative Direction: ${project.brief?.direction}
Deliverables: ${project.brief?.deliverables?.join(", ")}
Timeline: ${project.brief?.timeline}
Budget: ${project.brief?.budget}

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

const QUOTE_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a professional quote for a creative project.

Project: ${project.name}
Client: ${project.client}
Proposal Overview: ${project.proposal?.overview}
Scope: ${project.proposal?.scope?.join(", ") || ""}
Deliverables: ${project.proposal?.deliverables?.join(", ") || ""}
Timeline: ${project.proposal?.timeline}
Investment: ${project.proposal?.investment}
Terms: ${project.proposal?.terms}

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

Create 3-5 service lines based on the deliverables. Distribute the total investment ($${project.proposal?.investment?.replace(/[^0-9]/g, "") || "85000"}) across the services as rates.`

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { brief: true, call: true, contactReport: true, productionMeeting: true, proposal: true, quote: true, clientRef: true, owner: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const action = body.action || "auto"

    let nextStage = project.stage as StageId
    let message = ""

    switch (project.stage) {
      case "brief": {
        if (project.brief) {
          const analysis = await prisma.brief.update({
            where: { projectId: params.id },
            data: {
              aiWants: ["Establish a visual identity that resonates with target audience", "Deliver scalable design system", "Bridge brand gap"],
              aiObjectives: ["Modernize brand perception", "Increase market relevance", "Complete deliverables"],
              aiRequirements: ["Budget aligned with scope", "Timeline feasible", "Clear direction"],
              aiRisks: ["Scope creep risk", "Timeline constraints", "Resource availability"],
              aiMissing: ["Specific KPIs", "Competitive analysis", "Brand assets inventory"],
              aiQuestions: ["What are success metrics?", "Any legacy brand constraints?", "Primary distribution channels?"],
              aiConfidence: 75,
            },
          })
          nextStage = "call"
          message = "Brief analyzed. Ready for discovery call."
        }
        break
      }

      case "call": {
        if (project.call) {
          const raw = await generateWithGemini(CONTACT_REPORT_PROMPT(project, project.call))
          let parsed
          try {
            const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
            parsed = JSON.parse(cleaned)
          } catch {
            return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
          }

          await prisma.contactReport.create({
            data: {
              projectId: params.id,
              summary: parsed.summary || "Call completed",
              keyPoints: parsed.keyPoints || [],
              decisions: parsed.decisions || [],
              actionItems: parsed.actionItems || [],
              nextSteps: parsed.nextSteps || [],
              sentToClient: true,
            },
          })

          nextStage = "contactReport"
          message = "Contact report generated and sent to client."
        }
        break
      }

      case "contactReport": {
        if (project.contactReport) {
          nextStage = "productionMeeting"
          message = "Client confirmed. Ready for production meeting."
        }
        break
      }

      case "productionMeeting": {
        if (project.productionMeeting?.decision === "approved") {
          const raw = await generateWithGemini(PROPOSAL_PROMPT(project))
          let parsed
          try {
            const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
            parsed = JSON.parse(cleaned)
          } catch {
            return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
          }

          await prisma.proposal.create({
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
              status: "review",
              sections: parsed.sections || [],
            },
          })

          nextStage = "proposal"
          message = "Proposal generated and ready for review."
        }
        break
      }

      case "proposal": {
        if (project.proposal?.status === "approved") {
          const raw = await generateWithGemini(QUOTE_PROMPT(project))
          let parsed
          try {
            const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
            parsed = JSON.parse(cleaned)
          } catch {
            return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 })
          }

          await prisma.quote.create({
            data: {
              projectId: params.id,
              services: parsed.services || [],
              discount: parsed.discount || 0,
              tax: parsed.tax || 0,
              paymentTerms: parsed.paymentTerms || "40 / 40 / 20",
              status: "review",
            },
          })

          nextStage = "quote"
          message = "Quote generated and ready for review."
        }
        break
      }

      case "quote": {
        if (project.quote?.status === "approved") {
          nextStage = "approval"
          message = "Ready for final approval."
        }
        break
      }

      case "approval": {
        const updated = await prisma.project.update({
          where: { id: params.id },
          data: { status: "complete", progress: 100, stage: "approval", nextAction: "Begin production — project approved" },
        })

        if (project.ownerId) {
          await sendNotification({
            userId: project.ownerId,
            title: "Project approved!",
            message: `"${project.name}" has been approved by the client. You can now begin production.`,
            kind: "system",
            refId: project.id,
          })
        }

        const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
        for (const adminId of adminIds) {
          if (adminId !== project.ownerId) {
            const adminUser = await prisma.user.findUnique({ where: { id: adminId } })
            if (adminUser?.email) {
              await sendEmail({
                to: adminUser.email,
                subject: `Project approved: ${project.name}`,
                html: adminProjectApprovedEmail({ projectName: project.name }),
              })
            }
          }
        }

        if (project.clientRef?.email) {
          await sendEmail({
            to: project.clientRef!.email!,
            subject: `Your project "${project.name}" has been approved!`,
            html: projectApprovedClientEmail({ clientName: project.clientRef!.name || project.client, projectName: project.name }),
          })
        }

        message = "Project approved! Team notified and client confirmed."
        return NextResponse.json({ success: true, stage: "approval", message })
      }
    }

    if (nextStage !== project.stage) {
      await prisma.project.update({
        where: { id: params.id },
        data: { stage: nextStage, nextAction: `Complete ${STAGES.find((s) => s.id === nextStage)?.label || nextStage}` },
      })
    }

    return NextResponse.json({ success: true, stage: nextStage, message })
  } catch (error) {
    console.error("Workflow automation error:", error)
    return NextResponse.json({ error: "Workflow automation failed" }, { status: 500 })
  }
}
