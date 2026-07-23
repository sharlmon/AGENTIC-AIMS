export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { type: string; id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { brief: true, proposal: true, quote: true, contactReport: true, call: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const templatePath = `${baseUrl}/templates/${params.type}.html`

  let html = ""
  try {
    const res = await fetch(templatePath)
    html = await res.text()
  } catch {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  if (params.type === "presentation") {
    const b = project.brief
    const proposal = project.proposal
    const quote = project.quote
    const contactReport = project.contactReport
    const call = project.call

    const scope = Array.isArray(proposal?.scope) ? proposal.scope : (Array.isArray(b?.deliverables) ? b.deliverables : [])
    const deliverables = Array.isArray(proposal?.deliverables) ? proposal.deliverables : (Array.isArray(b?.deliverables) ? b.deliverables : [])
    const team = Array.isArray(proposal?.team) ? proposal.team : []
    const keyPoints = Array.isArray(contactReport?.keyPoints) ? contactReport.keyPoints : []
    const decisions = Array.isArray(contactReport?.decisions) ? contactReport.decisions : []
    const actionItems = Array.isArray(contactReport?.actionItems) ? contactReport.actionItems : []
    const nextSteps = Array.isArray(contactReport?.nextSteps) ? contactReport.nextSteps : []
    const services = Array.isArray(quote?.services) ? quote.services : []
    const subtotal = services.reduce((sum: number, s: any) => sum + (s.qty || 1) * (s.rate || 0), 0)

    const queryParams = new URLSearchParams()
    queryParams.set("client", project.client || "—")
    queryParams.set("company", b?.company || "—")
    queryParams.set("project", project.name || "—")
    queryParams.set("date", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
    queryParams.set("scope", JSON.stringify(scope))
    queryParams.set("deliverables", JSON.stringify(deliverables))
    queryParams.set("team", JSON.stringify(team))
    queryParams.set("keyPoints", JSON.stringify(keyPoints))
    queryParams.set("decisions", JSON.stringify(decisions))
    queryParams.set("actionItems", JSON.stringify(actionItems))
    queryParams.set("nextSteps", JSON.stringify(nextSteps))
    queryParams.set("services", JSON.stringify(services))
    queryParams.set("subtotal", subtotal.toString())
    queryParams.set("discount", (quote?.discount || 0).toString())
    queryParams.set("tax", (quote?.tax || 0).toString())
    queryParams.set("total", subtotal.toString())
    queryParams.set("paymentTerms", quote?.paymentTerms || "—")
    queryParams.set("status", proposal?.status === "approved" ? "Approved" : proposal?.status === "rejected" ? "Rejected" : "Pending Review")
    queryParams.set("meetingDate", call?.date ? new Date(call.date).toLocaleDateString() : "—")
    queryParams.set("participants", Array.isArray(call?.participants) ? call.participants.join(", ") : "—")
    queryParams.set("summary", contactReport?.summary || "—")
    queryParams.set("overview", proposal?.overview || b?.businessObjective || "—")
    queryParams.set("problem", proposal?.problem || "—")
    queryParams.set("solution", proposal?.solution || "—")
    queryParams.set("timeline", proposal?.timeline || b?.timeline || "—")
    queryParams.set("timeline2", proposal?.timeline || b?.timeline || "—")
    queryParams.set("investment", proposal?.investment || "—")
    queryParams.set("terms", proposal?.terms || quote?.paymentTerms || "—")
    queryParams.set("validUntil", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))

    return NextResponse.redirect(`${baseUrl}/templates/presentation.html?${queryParams.toString()}`)
  }

  const b = project.brief
  const proposal = project.proposal
  const quote = project.quote
  const contactReport = project.contactReport
  const call = project.call

  const replacements: Record<string, string> = {
    client: project.client || "—",
    company: b?.company || "—",
    industry: b?.industry || "—",
    contact: b?.contact || "—",
    title: project.name || "—",
    subtitle: `${project.type} Proposal`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    status: proposal?.status === "approved" ? "Approved" : proposal?.status === "rejected" ? "Rejected" : "Pending Review",
    overview: proposal?.overview || b?.businessObjective || "—",
    problem: proposal?.problem || "—",
    solution: proposal?.solution || "—",
    timeline: proposal?.timeline || b?.timeline || "—",
    investment: proposal?.investment || "—",
    terms: proposal?.terms || quote?.paymentTerms || "—",
    meetingDate: call?.date ? new Date(call.date).toLocaleDateString() : "—",
    participants: Array.isArray(call?.participants) ? call.participants.join(", ") : "—",
    summary: contactReport?.summary || "—",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  }

  const services = Array.isArray(quote?.services) ? quote.services : []
  const subtotal = services.reduce((sum: number, s: any) => sum + (s.qty || 1) * (s.rate || 0), 0)
  const discount = quote?.discount || 0
  const tax = quote?.tax || 0
  const total = subtotal

  const finalReplacements: Record<string, string> = {
    ...replacements,
    subtotal: `$${subtotal.toLocaleString()}`,
    discount: `$${discount.toLocaleString()}`,
    tax: `$${tax.toLocaleString()}`,
    total: `$${total.toLocaleString()}`,
    paymentTerms: quote?.paymentTerms || "—",
  }

  for (const [key, value] of Object.entries(finalReplacements)) {
    const regex = new RegExp(`id="${key}">([^<]*)<`, "g")
    html = html.replace(regex, `id="${key}">${value}<`)
  }

  const scope = Array.isArray(proposal?.scope) ? proposal.scope : (Array.isArray(b?.deliverables) ? b.deliverables : [])
  const deliverables = Array.isArray(proposal?.deliverables) ? proposal.deliverables : (Array.isArray(b?.deliverables) ? b.deliverables : [])
  const team = (Array.isArray(proposal?.team) ? proposal.team : []) as any[]
  const keyPoints = (Array.isArray(contactReport?.keyPoints) ? contactReport.keyPoints : []) as any[]
  const decisions = (Array.isArray(contactReport?.decisions) ? contactReport.decisions : []) as any[]
  const actionItems = (Array.isArray(contactReport?.actionItems) ? contactReport.actionItems : []) as any[]
  const nextSteps = (Array.isArray(contactReport?.nextSteps) ? contactReport.nextSteps : []) as any[]

  const renderList = (items: any[]) => {
    if (!items.length) return "<li>—</li>"
    return items.map((item: any) => {
      if (typeof item === "string") return `<li>${item}</li>`
      if (item.name) return `<li>${item.name}</li>`
      if (item.who) return `<li>${item.who}: ${item.task}</li>`
      return `<li>—</li>`
    }).join("")
  }

  html = html.replace(/<ul id="scope">[\s\S]*?<\/ul>/, `<ul id="scope">${renderList(scope)}</ul>`)
  html = html.replace(/<ul id="deliverables">[\s\S]*?<\/ul>/, `<ul id="deliverables">${renderList(deliverables)}</ul>`)

  const teamHtml = team.length
    ? team.map((t: string) => `<span class="team-tag">${t}</span>`).join("")
    : "<span style='color: #8e8e93;'>—</span>"
  html = html.replace(/<div class="team-list" id="team">[\s\S]*?<\/div>/, `<div class="team-list" id="team">${teamHtml}</div>`)

  const keyPointsHtml = keyPoints.length
    ? keyPoints.map((k: string) => `<li>${k}</li>`).join("")
    : "<li>—</li>"
  html = html.replace(/<ul id="keyPoints">[\s\S]*?<\/ul>/, `<ul id="keyPoints">${keyPointsHtml}</ul>`)

  const decisionsHtml = decisions.length
    ? decisions.map((d: string) => `<li>${d}</li>`).join("")
    : "<li>—</li>"
  html = html.replace(/<ul id="decisions">[\s\S]*?<\/ul>/, `<ul id="decisions">${decisionsHtml}</ul>`)

  const nextStepsHtml = nextSteps.length
    ? nextSteps.map((s: string) => `<li>${s}</li>`).join("")
    : "<li>—</li>"
  html = html.replace(/<ul id="nextSteps">[\s\S]*?<\/ul>/, `<ul id="nextSteps">${nextStepsHtml}</ul>`)

  const actionItemsHtml = actionItems.length
    ? actionItems.map((item: any) => `
        <div class="action-item">
          <span class="action-who">${item.who || ""}</span>
          <span class="action-task">${item.task || ""}</span>
          <span class="action-due">${item.due || ""}</span>
        </div>
      `).join("")
    : `<div class="action-item">
        <span class="action-who">—</span>
        <span class="action-task">No action items</span>
        <span class="action-due">—</span>
      </div>`
  html = html.replace(/<div id="actionItems">[\s\S]*?<\/div>/, `<div id="actionItems">${actionItemsHtml}</div>`)

  const servicesHtml = services.length
    ? services.map((s: any) => `
        <tr>
          <td><strong>${s.name || ""}</strong></td>
          <td>${s.desc || ""}</td>
          <td>${s.qty || 1}</td>
          <td>$${(s.rate || 0).toLocaleString()}</td>
        </tr>
      `).join("")
    : `<tr>
        <td colspan="4" style="text-align: center; color: #8e8e93; padding: 40px;">No services added</td>
      </tr>`
  html = html.replace(/<tbody id="services">[\s\S]*?<\/tbody>/, `<tbody id="services">${servicesHtml}</tbody>`)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store",
    },
  })
}
