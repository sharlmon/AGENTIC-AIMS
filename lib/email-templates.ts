const BRAND = {
  name: "Lumyn",
  domain: "lumyn.co.ke",
  email: "info@lumyn.co.ke",
  color: "#0f172a",
  accent: "#6366f1",
  buttonBg: "#0f172a",
  buttonText: "#ffffff",
  text: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
}

function wrap(title: string, body: string, preheader = "") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND.bg}; color: ${BRAND.text}; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    img { border: 0; outline: none; text-decoration: none; }
    a { color: ${BRAND.accent}; text-decoration: none; }
    .wrapper { width: 100%; max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background: #ffffff; border: 1px solid ${BRAND.border}; border-radius: 12px; overflow: hidden; }
    .header { background: ${BRAND.color}; padding: 24px 32px; }
    .header h1 { color: #ffffff; font-size: 18px; font-weight: 600; margin: 0; }
    .header p { color: #cbd5e1; font-size: 13px; margin: 4px 0 0; }
    .content { padding: 28px 32px; }
    .content h2 { color: ${BRAND.color}; font-size: 20px; font-weight: 600; margin: 0 0 12px; }
    .content p { line-height: 1.65; margin: 0 0 14px; font-size: 15px; }
    .content ul { padding-left: 18px; margin: 0 0 16px; }
    .content li { line-height: 1.6; margin-bottom: 6px; font-size: 15px; }
    .meta { background: ${BRAND.bg}; border: 1px dashed ${BRAND.border}; border-radius: 10px; padding: 14px 16px; margin: 16px 0; }
    .meta p { margin: 0; font-size: 14px; }
    .btn { display: inline-block; padding: 12px 18px; border-radius: 10px; background: ${BRAND.buttonBg}; color: ${BRAND.buttonText}; font-weight: 600; font-size: 14px; border: none; cursor: pointer; text-decoration: none; }
    .secondary { background: transparent; color: ${BRAND.color}; border: 1px solid ${BRAND.border}; }
    .actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; }
    .footer { padding: 18px 32px; border-top: 1px solid ${BRAND.border}; }
    .footer p { color: ${BRAND.muted}; font-size: 12px; margin: 0; }
    .greeting { font-weight: 600; color: ${BRAND.color}; }
    .divider { height: 1px; background: ${BRAND.border}; margin: 18px 0; }
  </style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 16px;">
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>${escapeHtml(BRAND.name)}</h1>
              <p>Creative Intelligence & Project Automation</p>
            </div>

            ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(preheader)}</div>` : ""}

            <div class="content">
              ${body}
            </div>

            <div class="footer">
              <p>${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.domain)} · ${escapeHtml(BRAND.email)}</p>
              <p style="margin-top: 6px;">This message was sent because you submitted a project request or are part of an active project.</p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function button(href: string, label: string, variant: "primary" | "secondary" = "primary") {
  const className = variant === "secondary" ? "btn secondary" : "btn"
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="${className}">${escapeHtml(label)}</a>`
}

export function callScheduledEmail(params: { clientName: string; projectName: string; dailyUrl: string }) {
  const { clientName, projectName, dailyUrl } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>We are excited to get started. A discovery call has been scheduled for your project <strong>${escapeHtml(projectName)}</strong>.</p>
    <div class="actions">
      ${button(dailyUrl, "Join Meeting")}
    </div>
    <div class="divider"></div>
    <p style="color: ${BRAND.muted}; font-size: 14px;">The meeting link will be active at the scheduled time. If you cannot make it, reply to this email and we will reschedule.</p>
  `
  return wrap("Discovery call scheduled", body, `Your discovery call for ${projectName} is scheduled. Click to join.`)
}

export function contactReportReadyEmail(params: { clientName: string; projectName: string; summary: string }) {
  const { clientName, projectName, summary } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>Thank you for the discovery call. Here is a summary of what we discussed for <strong>${escapeHtml(projectName)}</strong>.</p>
    <div class="meta">
      <p><strong>Summary</strong></p>
      <p style="margin-top: 6px;">${escapeHtml(summary)}</p>
    </div>
    <p>We are now preparing the production plan and proposal. We will be in touch shortly with the next steps.</p>
  `
  return wrap("Contact report ready", body, `Contact report for ${projectName} is ready.`)
}

export function proposalReadyEmail(params: { clientName: string; projectName: string; proposalUrl: string; projectUrl: string }) {
  const { clientName, projectName, proposalUrl, projectUrl } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>Your proposal for <strong>${escapeHtml(projectName)}</strong> is ready for review.</p>
    <p style="color: ${BRAND.muted}; font-size: 14px;">Please review the proposal and let us know if you have any questions before approving.</p>
    <div class="actions">
      ${button(proposalUrl, "Review Proposal", "primary")}
      ${button(projectUrl, "View Project", "secondary")}
    </div>
  `
  return wrap("Proposal ready", body, `Your proposal for ${projectName} is ready for review.`)
}

export function quoteReadyEmail(params: { clientName: string; projectName: string; quoteUrl: string }) {
  const { clientName, projectName, quoteUrl } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>Your quote for <strong>${escapeHtml(projectName)}</strong> is ready.</p>
    <p style="color: ${BRAND.muted}; font-size: 14px;">The quote is based on the approved proposal. Review it and approve to get started.</p>
    <div class="actions">
      ${button(quoteUrl, "Review Quote", "primary")}
    </div>
  `
  return wrap("Quote ready", body, `Your quote for ${projectName} is ready.`)
}

export function proposalApprovedEmail(params: { clientName: string; projectName: string; bothApproved: boolean }) {
  const { clientName, projectName, bothApproved } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>Great! You approved the proposal for <strong>${escapeHtml(projectName)}</strong>.</p>
    <p>${bothApproved ? "The quote has also been approved. We are getting started." : "The quote will follow shortly for your final approval."}</p>
  `
  return wrap("Proposal approved", body, `Proposal approved for ${projectName}.`)
}

export function quoteApprovedEmail(params: { clientName: string; projectName: string; proposalApproved: boolean }) {
  const { clientName, projectName, proposalApproved } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>You approved the quote for <strong>${escapeHtml(projectName)}</strong>.</p>
    <p>${proposalApproved ? "The proposal has also been approved. We are getting started." : "The proposal approval will follow."}</p>
    <p>Our team will be in touch shortly to kick things off.</p>
  `
  return wrap("Quote approved", body, `Quote approved for ${projectName}.`)
}

export function projectFullyApprovedEmail(params: { clientName: string; projectName: string }) {
  const { clientName, projectName } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>Your project <strong>${escapeHtml(projectName)}</strong> has been fully approved.</p>
    <p>Our team will be in touch shortly to kick things off.</p>
    <div class="actions">
      ${button(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/public/project`, "View Project", "primary")}
    </div>
  `
  return wrap("Project approved", body, `${projectName} is approved and ready to begin.`)
}

export function adminProjectApprovedEmail(params: { projectName: string }) {
  const { projectName } = params
  const body = `
    <p><strong>${escapeHtml(projectName)}</strong> has been fully approved by the client.</p>
    <div class="meta">
      <p><strong>Status:</strong> Complete</p>
      <p style="margin-top: 4px;"><strong>Next action:</strong> Begin production</p>
    </div>
    <div class="actions">
      ${button(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/projects`, "Open Dashboard", "primary")}
    </div>
  `
  return wrap("Project approved", body, `${projectName} is ready to begin.`)
}

export function meetingCompletedEmail(params: { projectName: string; clientName: string }) {
  const { projectName, clientName } = params
  const body = `
    <p>The discovery call for <strong>${escapeHtml(projectName)}</strong> has been completed.</p>
    <p>Proposal and quote have been generated and sent to <strong>${escapeHtml(clientName)}</strong>.</p>
    <div class="meta">
      <p><strong>Next action:</strong> Awaiting client approval</p>
    </div>
  `
  return wrap("Meeting completed", body, `Discovery call completed for ${projectName}.`)
}

export function projectApprovedClientEmail(params: { clientName: string; projectName: string }) {
  const { clientName, projectName } = params
  const body = `
    <p class="greeting">Hi ${escapeHtml(clientName)},</p>
    <p>Great news! Your project <strong>${escapeHtml(projectName)}</strong> has been approved and we are getting started.</p>
    <p>Our team will be in touch shortly with next steps.</p>
    <div class="actions">
      ${button(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/public/project`, "View Project", "primary")}
    </div>
  `
  return wrap("Project approved", body, `${projectName} is approved and ready to begin.`)
}
