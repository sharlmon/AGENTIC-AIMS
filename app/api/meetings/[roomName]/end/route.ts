import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
import { sendNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { proposalReadyEmail, quoteReadyEmail, meetingCompletedEmail } from "@/lib/email-templates"

function cleanJson(text: string): any {
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

async function withRetry<T>(fn: () => Promise<T>, fallback: T, retries = 3, delayMs = 2000): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === retries - 1) {
        console.error(`Meeting step failed after ${retries} attempts:`, error)
        return fallback
      }
      await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
    }
  }
  return fallback
}

export async function POST(req: Request, { params }: { params: { roomName: string } }) {
  try {
    const body = await req.json()
    const { projectId, notes, transcript, meetingSource, artifacts } = body

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { brief: true, call: true, contactReport: true, proposal: true, quote: true, clientRef: true, owner: true },
    })

    if (!project || !project.brief) {
      return NextResponse.json({ error: "Project or brief not found" }, { status: 404 })
    }

    const b = project.brief
    const clientEmail = b.contact || project.clientRef?.email || "client@example.com"
    const clientName = b.clientName || project.clientRef?.name || "Client"

    // 1. Update/create ClientCall
    const callData: any = {
      date: new Date().toISOString().split('T')[0],
      duration: "45 minutes",
      participants: [clientName, "Producer", "Strategist"],
      summary: notes?.slice(0, 500) || transcript?.slice(0, 500) || "Discovery call completed.",
    }

    if (params.roomName) {
      callData.roomName = params.roomName
      callData.roomUrl = `https://synthos.daily.co/${params.roomName}`
    }

    if (meetingSource) callData.meetingSource = meetingSource
    if (artifacts?.length) callData.artifacts = artifacts
    if (transcript) callData.transcript = transcript

    const clientCall = project.call
      ? await prisma.clientCall.update({ where: { projectId }, data: callData })
      : await prisma.clientCall.create({ data: { projectId, ...callData } })

    // 2. Generate Contact Report using AI
    const contactReportPrompt = `You are a creative intelligence AI. Generate a professional contact report for a client meeting.

Project: ${b.title}
Client: ${b.company}
Meeting Notes: ${notes}
Transcript: ${transcript || "No transcript available"}

Return ONLY a JSON object:
{
  "summary": "Brief summary of the meeting (2-3 sentences)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "decisions": ["decision 1", "decision 2"],
  "actionItems": [{"who": "client/admin", "task": "...", "due": "date"}],
  "nextSteps": ["next step 1", "next step 2"]
}`

    const contactReportData = await withRetry(
      () => generateWithGemini(contactReportPrompt).then(cleanJson),
      {
        summary: "Meeting completed. Key topics discussed.",
        keyPoints: ["Client requirements captured", "Budget discussed", "Timeline agreed"],
        decisions: ["Proceed with proposal"],
        actionItems: [{ who: "Admin", task: "Send proposal to client", due: "ASAP" }],
        nextSteps: ["Generate proposal", "Schedule follow-up"],
      }
    )

    const contactReport = project.contactReport
      ? await prisma.contactReport.update({ where: { projectId }, data: { ...contactReportData, sentToClient: true } })
      : await prisma.contactReport.create({ data: { projectId, ...contactReportData, sentToClient: true } })

    // 3. Generate Proposal from meeting
    const proposalPrompt = `You are a creative intelligence AI. Generate a professional client proposal based on this meeting.

Project: ${b.title}
Client: ${b.company}
Industry: ${b.industry}
Business Objective: ${b.businessObjective}
Audience: ${b.audience}
Brand Context: ${b.brand}
Creative Direction: ${b.direction}
Deliverables: ${(b.deliverables || []).join(", ")}
Timeline: ${b.timeline}
Budget: ${b.budget}

Meeting Summary: ${contactReportData.summary}
Key Points: ${(contactReportData.keyPoints || []).join("; ")}
Decisions: ${(contactReportData.decisions || []).join("; ")}
Next Steps: ${(contactReportData.nextSteps || []).join("; ")}

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

    const proposalData = await withRetry(
      () => generateWithGemini(proposalPrompt).then(cleanJson),
      {
        clientDetails: `${b.company} — ${clientName}`,
        overview: contactReportData.summary,
        problem: `Current challenge: ${b.businessObjective}`,
        solution: b.direction,
        scope: b.deliverables,
        deliverables: b.deliverables,
        timeline: b.timeline,
        team: ["Creative Writer", "Producer", "Account Manager"],
        investment: b.budget,
        terms: "40% start, 40% midpoint, 20% on delivery",
        status: "review",
        sections: [
          { title: "Context", body: contactReportData.summary, attr: "ai" },
          { title: "Approach", body: "Structured workflow with clear milestones.", attr: "mixed" },
        ],
      }
    )

    const proposalPublicToken = crypto.randomUUID()
    const proposal = project.proposal
      ? await prisma.proposal.update({
          where: { projectId },
          data: {
            clientDetails: proposalData.clientDetails,
            overview: proposalData.overview,
            problem: proposalData.problem,
            solution: proposalData.solution,
            scope: proposalData.scope || [],
            deliverables: proposalData.deliverables || [],
            timeline: proposalData.timeline,
            team: proposalData.team || [],
            investment: proposalData.investment,
            terms: proposalData.terms,
            status: "review",
            sections: proposalData.sections || [],
            publicToken: proposalPublicToken,
            sentToClient: true,
            sentAt: new Date(),
          },
        })
      : await prisma.proposal.create({
          data: {
            projectId,
            ...proposalData,
            publicToken: proposalPublicToken,
            sentToClient: true,
            sentAt: new Date(),
          },
        })

    // 4. Generate Quote from proposal
    const total = parseInt(proposalData.investment?.replace(/[^0-9]/g, "") || "0") || 50000
    const count = (proposalData.deliverables || []).length || 3
    const baseRate = Math.round(total / count)

    const services = (proposalData.deliverables || []).map((d: string) => ({
      name: d,
      desc: `As specified in proposal`,
      qty: 1,
      rate: baseRate,
    }))

    const quotePublicToken = crypto.randomUUID()
    const quote = project.quote
      ? await prisma.quote.update({
          where: { projectId },
          data: { services, discount: 0, tax: 0, paymentTerms: "40 / 40 / 20", status: "review", publicToken: quotePublicToken, sentToClient: true, sentAt: new Date() },
        })
      : await prisma.quote.create({
          data: { projectId, services, discount: 0, tax: 0, paymentTerms: "40 / 40 / 20", status: "review", publicToken: quotePublicToken, sentToClient: true, sentAt: new Date() },
        })

    // 5. Update project stage and generate public token
    const publicToken = project.publicToken || crypto.randomUUID()
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: "approval",
        nextAction: "Awaiting client approval",
        publicToken,
      },
    })

    // 6. Send emails to client
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const proposalUrl = `${baseUrl}/public/approve/${proposalPublicToken}`
    const projectUrl = `${baseUrl}/public/project/${publicToken}`

    await sendEmail({
      to: clientEmail,
      subject: `Proposal ready: ${project.name}`,
      html: proposalReadyEmail({ clientName, projectName: project.name, proposalUrl: proposalUrl, projectUrl }),
    })

    await sendEmail({
      to: clientEmail,
      subject: `Quote ready: ${project.name}`,
      html: quoteReadyEmail({ clientName, projectName: project.name, quoteUrl: `${baseUrl}/public/approve/${quotePublicToken}` }),
    })

    // 7. Send conversation messages to client
    await prisma.conversation.create({
      data: {
        projectId,
        participants: [clientEmail],
        messages: {
          create: [
            {
              senderId: "system",
              senderName: "Synthos AI",
              senderRole: "system",
              recipientId: clientEmail,
              subject: `Contact Report: ${b.title}`,
              body: `Dear ${clientName},\n\nThank you for the meeting. Here is the contact report:\n\n${contactReportData.summary}\n\nKey Points:\n${(contactReportData.keyPoints || []).map((p: any) => `- ${p}`).join("\n")}\n\nNext Steps:\n${(contactReportData.nextSteps || []).map((s: any) => `- ${s}`).join("\n")}\n\nWe will send the proposal shortly.\n\nBest regards,\nSynthos`,
              kind: "report",
              refId: contactReport.id,
            },
            {
              senderId: "system",
              senderName: "Synthos AI",
              senderRole: "system",
              recipientId: clientEmail,
              subject: `Proposal: ${b.title}`,
              body: `Dear ${clientName},\n\nPlease find attached the proposal for ${project.name}.\n\nInvestment: ${proposalData.investment}\nTimeline: ${proposalData.timeline}\n\nPlease review and let us know if you have any questions.\n\nBest regards,\nSynthos`,
              kind: "proposal",
              refId: proposal.id,
            },
          ],
        },
      },
    })

    // 8. Notify team
    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: "Meeting completed — proposal ready",
        message: `Discovery call for "${project.name}" completed. Contact report, proposal, and quote generated.`,
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
              subject: `Meeting completed: ${project.name}`,
              html: meetingCompletedEmail({ projectName: project.name, clientName }),
            })
        }
      }
    }

    return NextResponse.json({
      contactReport,
      proposal,
      quote,
      message: "Meeting ended. Contact report, proposal, quote generated and sent to client.",
    })
  } catch (error) {
    console.error("Meeting end error:", error)
    return NextResponse.json({ error: "Failed to process meeting" }, { status: 500 })
  }
}
