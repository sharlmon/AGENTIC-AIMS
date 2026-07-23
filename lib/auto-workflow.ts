import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
import { sendEmail } from "@/lib/email"
import { sendNotification } from "@/lib/notifications"
import { callScheduledEmail, contactReportReadyEmail, proposalReadyEmail, quoteReadyEmail } from "@/lib/email-templates"

export async function createDailyRoom(roomName: string): Promise<string> {
  const dailyApiKey = process.env.DAILY_API_KEY
  if (!dailyApiKey) return `https://synthos.daily.co/${roomName}`
  
  try {
    const createRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
        },
      }),
    })
    const createData = await createRes.json()
    if (createData?.url) return createData.url
  } catch (e) {
    console.error("Failed to create Daily.co room:", e)
  }
  return `https://synthos.daily.co/${roomName}`
}

const CONTACT_REPORT_FROM_BRIEF_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a professional contact report for a client meeting based on the project brief ${project.call?.meetingSource && project.call.meetingSource !== "embedded" ? "and the real meeting transcript" : ""}.

Project: ${project.name}
Client: ${project.client}
Company: ${project.brief?.company || "N/A"}
Industry: ${project.brief?.industry || "N/A"}
Business Objective: ${project.brief?.businessObjective || "N/A"}
Audience: ${project.brief?.audience || "N/A"}
Creative Direction: ${project.brief?.direction || "N/A"}
Deliverables: ${project.brief?.deliverables?.join(", ") || "TBD"}
Budget: ${project.brief?.budget || "N/A"}
Timeline: ${project.brief?.timeline || "N/A"}
Meeting Source: ${project.call?.meetingSource || "N/A"}
Participants: ${(project.call?.participants || []).join(", ") || "N/A"}
Call Summary: ${project.call?.summary || "N/A"}
${project.call?.transcript ? `Real Transcript: ${project.call.transcript.substring(0, 4000)}` : ""}

Return ONLY JSON:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "decisions": ["...", "..."],
  "actionItems": [{"who": "...", "task": "...", "due": "..."}],
  "nextSteps": ["...", "..."]
}`

const PRODUCTION_MEETING_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a detailed production meeting plan.

Project: ${project.name}
Client: ${project.client}
Business Objective: ${project.brief?.businessObjective || ""}
Audience: ${project.brief?.audience || ""}
Creative Direction: ${project.brief?.direction || ""}
Deliverables: ${project.brief?.deliverables?.join(", ") || "TBD"}
Budget: ${project.brief?.budget || "N/A"}
Timeline: ${project.brief?.timeline || "N/A"}
${project.call?.transcript ? `Meeting Transcript: ${project.call.transcript.substring(0, 3000)}` : ""}

Return ONLY JSON:
{
  "decision": "approved",
  "notes": "Team aligned on scope, timeline, and deliverables. Ready to proceed to proposal.",
  "agenda": ["Review brief and confirm objectives", "Align on creative direction and deliverables", "Confirm timeline and budget", "Assign team roles", "Next steps and kickoff plan"],
  "team": ["Producer", "Creative Director", "Strategist"],
  "timeline": "${project.brief?.timeline || "8-12 weeks"}",
  "deliverables": ${JSON.stringify(project.brief?.deliverables || ["Final Deliverables"])},
  "budget": "${project.brief?.budget || "$50,000 - $100,000"}"
}`

const PROPOSAL_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a professional client proposal.

Project: ${project.name}
Client: ${project.client}
${project.call?.summary ? `Call Summary: ${project.call.summary}` : ""}
${project.call?.transcript ? `Meeting Transcript: ${project.call.transcript.substring(0, 3000)}` : ""}
Business Objective: ${project.brief?.businessObjective}
Audience: ${project.brief?.audience}
Creative Direction: ${project.brief?.direction}
Deliverables: ${project.brief?.deliverables?.join(", ") || "TBD"}
Timeline: ${project.brief?.timeline || "8-12 weeks"}
Budget: ${project.brief?.budget || "$50,000 - $100,000"}

Return ONLY JSON:
{
  "clientDetails": "${project.client} / ${project.brief?.company || ""}",
  "overview": "A comprehensive creative project...",
  "problem": "The client needs...",
  "solution": "We will...",
  "scope": ["...", "..."],
  "deliverables": ["...", "..."],
  "timeline": "${project.brief?.timeline || "8-12 weeks"}",
  "team": ["Strategist", "Creative Director", "Producer"],
  "investment": "$${Math.floor(Math.random() * 50000 + 50000).toLocaleString()}",
  "terms": "40% start, 40% midpoint, 20% on delivery",
  "status": "review",
  "sections": [
    { "title": "Context", "body": "...", "attr": "ai" },
    { "title": "Approach", "body": "...", "attr": "mixed" }
  ]
}`

const QUOTE_PROMPT = (project: any) => `You are a creative intelligence AI. Generate a professional quote.

Project: ${project.name}
Client: ${project.client}
${project.call?.summary ? `Call Summary: ${project.call.summary}` : ""}
${project.call?.transcript ? `Meeting Transcript: ${project.call.transcript.substring(0, 3000)}` : ""}
Proposal Overview: ${project.proposal?.overview || ""}
Scope: ${project.proposal?.scope?.join(", ") || ""}
Deliverables: ${project.proposal?.deliverables?.join(", ") || ""}
Timeline: ${project.proposal?.timeline}
Investment: ${project.proposal?.investment}
Terms: ${project.proposal?.terms}

Return ONLY JSON:
{
  "services": [
    { "name": "Strategy & Discovery", "desc": "Research, analysis, and strategic framework", "qty": 1, "rate": 15000 },
    { "name": "Creative Development", "desc": "Concept, design, and production", "qty": 1, "rate": 35000 },
    { "name": "Project Management", "desc": "Coordination, reviews, and delivery", "qty": 1, "rate": 15000 },
    { "name": "Revisions", "desc": "Two rounds of revisions", "qty": 2, "rate": 10000 }
  ],
  "discount": 0,
  "tax": 0,
  "paymentTerms": "40 / 40 / 20",
  "status": "review"
}`

const FALLBACKS = {
  contactReport: { summary: "Project brief reviewed successfully", keyPoints: ["Discussed project scope", "Aligned on timeline", "Confirmed budget"], decisions: ["Proceed with proposed approach"], actionItems: [{ who: "Producer", task: "Schedule follow-up", due: "TBD" }], nextSteps: ["Generate proposal", "Send to client for review"] },
  productionMeeting: { decision: "approved", notes: "Team aligned on scope, timeline, and deliverables. Ready to proceed to proposal.", agenda: ["Review brief and confirm objectives", "Align on creative direction and deliverables", "Confirm timeline and budget", "Assign team roles", "Next steps and kickoff plan"], team: ["Producer", "Creative Director", "Strategist"], timeline: "8-12 weeks", deliverables: ["Final Deliverables"], budget: "$50,000 - $100,000" },
  proposal: { clientDetails: "", overview: "A comprehensive creative project proposal tailored to the client's needs.", problem: "The client needs creative work that resonates with their audience and drives results.", solution: "We will deliver a complete creative solution from strategy to execution.", scope: ["Strategy", "Creative Development", "Production"], deliverables: ["Final Deliverables"], timeline: "8-12 weeks", team: ["Strategist", "Creative Director", "Producer"], investment: "$85,000", terms: "40% start, 40% midpoint, 20% on delivery", status: "review", sections: [{ title: "Context", body: "Understanding the client's needs and market position.", attr: "ai" }, { title: "Approach", body: "A tailored creative approach that meets the project objectives.", attr: "mixed" }] },
  quote: { services: [{ name: "Strategy & Discovery", desc: "Research, analysis, and strategic framework", qty: 1, rate: 15000 }, { name: "Creative Development", desc: "Concept, design, and production", qty: 1, rate: 35000 }, { name: "Project Management", desc: "Coordination, reviews, and delivery", qty: 1, rate: 15000 }, { name: "Revisions", desc: "Two rounds of revisions", qty: 2, rate: 10000 }], discount: 0, tax: 0, paymentTerms: "40 / 40 / 20", status: "review" },
}

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
        console.error(`Workflow step failed after ${retries} attempts:`, error)
        return fallback
      }
      await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
    }
  }
  return fallback
}

export async function runAutoWorkflow(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { brief: true, call: true, contactReport: true, productionMeeting: true, proposal: true, quote: true, clientRef: true },
  })

  if (!project) return { error: "Project not found" }

  if (!project) return { stage: "brief", steps: [] }
  const projectWithClient = project as any
  let currentStage = project.stage
  const results: any = { stage: currentStage, steps: [] }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  async function persistStatus(stage: string, step: string, status: string) {
    const workflowStatus = {
      ...((project.aiWorkflowStatus as any) || {}),
      [stage]: { step, status, updatedAt: new Date().toISOString() },
      currentStage: stage,
    }
    await prisma.project.update({
      where: { id: projectId },
      data: { aiWorkflowStatus: workflowStatus },
    })
  }

  try {
    const hasRealCall = !!project?.call && Array.isArray(project.call.participants) && project.call.participants.length > 0
    const hasRealContactReport = !!project.contactReport && project.contactReport.sentToClient
    const hasRealProposal = !!project.proposal
    const hasRealQuote = !!project.quote
    const isExternalMeeting = !!(project.call && project.call.meetingSource !== "embedded" && project.call.transcript)

    if (currentStage === "brief" && project.brief) {
      if (!hasRealCall && !isExternalMeeting) {
        await prisma.project.update({ where: { id: projectId }, data: { stage: "call", nextAction: "Discovery call scheduled" } })
        currentStage = "call"
        await persistStatus("call", "schedule", "in_progress")

        const roomName = `synthos-${projectId}-${Date.now()}`
        const dailyUrl = await createDailyRoom(roomName)

        await prisma.clientCall.create({
          data: {
            projectId,
            date: new Date().toISOString().split("T")[0],
            duration: "45 minutes",
            participants: ["Client", "Producer", "Strategist"],
            summary: "Meeting scheduled via AI automation",
            meetingSource: "embedded",
            roomName,
            roomUrl: dailyUrl,
          },
        })
        results.call = { roomName, roomUrl: dailyUrl }
        results.steps.push({ stage: "call", step: "schedule", status: "completed", url: dailyUrl })

        if (project.ownerId) {
          await sendNotification({
            userId: project.ownerId,
            title: "Discovery call scheduled",
            message: `A discovery call has been scheduled for "${project.name}". Join here: ${dailyUrl}`,
            kind: "info",
            refId: project.id,
          })
        }

        if (projectWithClient?.clientRef?.email) {
          await sendEmail({
            to: projectWithClient.clientRef.email,
            subject: `Discovery call scheduled: ${project.name}`,
            html: callScheduledEmail({ clientName: projectWithClient.clientRef.name || project.client, projectName: project.name, dailyUrl }),
          })
        }

        await persistStatus("call", "schedule", "completed")
      } else if (isExternalMeeting) {
        await prisma.project.update({ where: { id: projectId }, data: { stage: "proposal", nextAction: "Generating proposal from external meeting transcript" } })
        currentStage = "proposal"
        await persistStatus("call", "skipped", "skipped")
        await persistStatus("contactReport", "skipped", "skipped")
        await persistStatus("productionMeeting", "skipped", "skipped")
        await persistStatus("proposal", "generate", "in_progress")
      } else {
        currentStage = "contactReport"
        await prisma.project.update({ where: { id: projectId }, data: { stage: "contactReport", nextAction: "Client confirmed. Ready for production meeting." } })
        await persistStatus("contactReport", "generate", "in_progress")
      }
    }

    if (currentStage === "call") {
      const call = await prisma.clientCall.findUnique({ where: { projectId } })
      if (call && !hasRealContactReport) {
        const reportData = await withRetry(
          () => generateWithGemini(CONTACT_REPORT_FROM_BRIEF_PROMPT(project)).then(cleanJson),
          FALLBACKS.contactReport
        )

        await prisma.contactReport.create({
          data: { projectId, summary: reportData.summary, keyPoints: reportData.keyPoints, decisions: reportData.decisions, actionItems: reportData.actionItems, nextSteps: reportData.nextSteps, sentToClient: true },
        })
        await prisma.project.update({ where: { id: projectId }, data: { stage: "contactReport", nextAction: "Client confirmed. Ready for production meeting." } })
        currentStage = "contactReport"
        results.contactReport = reportData
        results.steps.push({ stage: "contactReport", step: "generate", status: "completed" })

        await persistStatus("contactReport", "generate", "completed")

        if (projectWithClient?.clientRef?.email) {
          await sendEmail({
            to: projectWithClient.clientRef.email,
            subject: `Contact report ready: ${project.name}`,
            html: contactReportReadyEmail({ clientName: projectWithClient.clientRef.name || project.client, projectName: project.name, summary: reportData.summary }),
          })
        }

        if (project.ownerId) {
          await sendNotification({
            userId: project.ownerId,
            title: "AI generated preliminary contact report",
            message: `AI created a preliminary contact report for "${project.name}" from the brief.`,
            kind: "info",
            refId: project.id,
          })
        }
      } else if (hasRealContactReport) {
        await prisma.project.update({ where: { id: projectId }, data: { stage: "contactReport", nextAction: "Client confirmed. Ready for production meeting." } })
        currentStage = "contactReport"
        await persistStatus("contactReport", "generate", "completed")
      }
    }

    if (currentStage === "contactReport") {
      await prisma.project.update({ where: { id: projectId }, data: { stage: "productionMeeting", nextAction: "Production meeting completed" } })
      currentStage = "productionMeeting"
      await persistStatus("productionMeeting", "plan", "in_progress")

      const pmData = await withRetry(
        () => generateWithGemini(PRODUCTION_MEETING_PROMPT(project)).then(cleanJson),
        FALLBACKS.productionMeeting
      )

      await prisma.productionMeeting.create({
        data: { projectId, decision: pmData.decision || "approved", notes: pmData.notes },
      })
      results.productionMeeting = pmData
      results.steps.push({ stage: "productionMeeting", step: "plan", status: "completed" })

      await persistStatus("productionMeeting", "plan", "completed")

      if (project.ownerId) {
        await sendNotification({
          userId: project.ownerId,
          title: "AI completed production meeting",
          message: `AI generated a production meeting plan for "${project.name}". Proposal generation starting.`,
          kind: "info",
          refId: project.id,
        })
      }
    }

    if (currentStage === "productionMeeting") {
      if (!hasRealProposal) {
        const proposalData = await withRetry(
          () => generateWithGemini(PROPOSAL_PROMPT(project)).then(cleanJson),
          FALLBACKS.proposal
        )

        const publicToken = crypto.randomUUID()
        await prisma.proposal.create({
          data: { projectId, clientDetails: proposalData.clientDetails, overview: proposalData.overview, problem: proposalData.problem, solution: proposalData.solution, scope: proposalData.scope, deliverables: proposalData.deliverables, timeline: proposalData.timeline, team: proposalData.team, investment: proposalData.investment, terms: proposalData.terms, status: "review", sections: proposalData.sections, publicToken, sentToClient: true, sentAt: new Date() },
        })
        await prisma.project.update({ where: { id: projectId }, data: { stage: "proposal", nextAction: "Proposal sent to client for review" } })
        currentStage = "proposal"
        results.proposal = proposalData
        results.steps.push({ stage: "proposal", step: "generate", status: "completed" })

        await persistStatus("proposal", "generate", "completed")

        if (project.ownerId) {
          await sendNotification({
            userId: project.ownerId,
            title: "AI generated proposal",
            message: `AI drafted a proposal for "${project.name}". It has been sent to the client for review.`,
            kind: "info",
            refId: project.id,
          })
        }
      } else {
        await prisma.project.update({ where: { id: projectId }, data: { stage: "proposal", nextAction: "Proposal sent to client for review" } })
        currentStage = "proposal"
        await persistStatus("proposal", "generate", "completed")
      }
    }

    if (currentStage === "proposal") {
      const proposal = await prisma.proposal.findUnique({ where: { projectId } })
      if (proposal && !hasRealQuote) {
        const quoteData = await withRetry(
          () => generateWithGemini(QUOTE_PROMPT(project)).then(cleanJson),
          FALLBACKS.quote
        )

        const publicToken = crypto.randomUUID()
        await prisma.quote.create({
          data: { projectId, services: quoteData.services, discount: quoteData.discount, tax: quoteData.tax, paymentTerms: quoteData.paymentTerms, status: "review", publicToken, sentToClient: true, sentAt: new Date() },
        })
        await prisma.project.update({ where: { id: projectId }, data: { stage: "quote", nextAction: "Quote sent to client for review" } })
        currentStage = "quote"
        results.quote = quoteData
        results.steps.push({ stage: "quote", step: "generate", status: "completed" })

        await persistStatus("quote", "generate", "completed")

        if (project.ownerId) {
          await sendNotification({
            userId: project.ownerId,
            title: "AI generated quote",
            message: `AI created a quote for "${project.name}" based on the proposal. Sent to client.`,
            kind: "info",
            refId: project.id,
          })
        }
      } else if (hasRealQuote) {
        await prisma.project.update({ where: { id: projectId }, data: { stage: "quote", nextAction: "Quote sent to client for review" } })
        currentStage = "quote"
        await persistStatus("quote", "generate", "completed")
      }
    }

    if (currentStage === "quote") {
      await prisma.project.update({ where: { id: projectId }, data: { stage: "approval", nextAction: "Awaiting client approval" } })
      currentStage = "approval"
      results.steps.push({ stage: "approval", step: "await", status: "in_progress" })

      await persistStatus("approval", "await", "in_progress")

      if (project.ownerId) {
        await sendNotification({
          userId: project.ownerId,
          title: "Project ready for client approval",
          message: `"${project.name}" has completed the AI workflow and is now awaiting client approval.`,
          kind: "info",
          refId: project.id,
        })
      }
    }

    if (currentStage === "approval") {
      await prisma.project.update({ where: { id: projectId }, data: { nextAction: "Awaiting client approval" } })
      results.completed = false
      await persistStatus("approval", "await", "in_progress")
    }

    if (!projectWithClient.publicToken) {
      const publicToken = crypto.randomUUID()
      await prisma.project.update({ where: { id: projectId }, data: { publicToken } })
    }

    const proposal = await prisma.proposal.findUnique({ where: { projectId } })
    const quote = await prisma.quote.findUnique({ where: { projectId } })

    if (proposal?.publicToken && projectWithClient?.clientRef?.email && !proposal.sentToClient) {
      const proposalUrl = `${baseUrl}/public/approve/${proposal.publicToken}`
      const projectUrl = `${baseUrl}/public/project/${projectWithClient.publicToken || ""}`
      await sendEmail({
        to: projectWithClient.clientRef.email,
        subject: `Proposal ready: ${project.name}`,
        html: proposalReadyEmail({ clientName: projectWithClient.clientRef.name || project.client, projectName: project.name, proposalUrl, projectUrl }),
      })
      await prisma.proposal.update({ where: { projectId }, data: { sentToClient: true, sentAt: new Date() } })

      if (project.ownerId) {
        await sendNotification({
          userId: project.ownerId,
          title: "AI sent proposal to client",
          message: `AI automatically sent the proposal for "${project.name}" to ${projectWithClient.clientRef.email}.`,
          kind: "info",
          refId: project.id,
        })
      }
    }

    if (quote?.publicToken && projectWithClient?.clientRef?.email && !quote.sentToClient) {
      const quoteUrl = `${baseUrl}/public/approve/${quote.publicToken}`
      await sendEmail({
        to: projectWithClient.clientRef.email,
        subject: `Quote ready: ${project.name}`,
        html: quoteReadyEmail({ clientName: projectWithClient.clientRef.name || project.client, projectName: project.name, quoteUrl }),
      })
      await prisma.quote.update({ where: { projectId }, data: { sentToClient: true, sentAt: new Date() } })

      if (project.ownerId) {
        await sendNotification({
          userId: project.ownerId,
          title: "AI sent quote to client",
          message: `AI automatically sent the quote for "${project.name}" to ${projectWithClient.clientRef.email}.`,
          kind: "info",
          refId: project.id,
        })
      }
    }

    await persistStatus(currentStage, currentStage === "approval" ? "await" : "completed", currentStage === "approval" ? "in_progress" : "completed")

    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: "AI workflow completed",
        message: `All automation steps finished for "${project.name}". Project is now ready for client review.`,
        kind: "info",
        refId: project.id,
      })
    }

    results.stage = currentStage
    return { success: true, stage: currentStage, results }
  } catch (error) {
    console.error("Auto-workflow error:", error)
    await persistStatus(currentStage, "error", "failed")
    return { error: "Auto-workflow failed", details: error }
  }
}
