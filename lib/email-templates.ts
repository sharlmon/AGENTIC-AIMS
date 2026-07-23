const BRAND = {
  name: "Synthos",
  domain: "synthos.dev",
  email: "info@synthos.dev",
  color: "#09090b",
  accent: "#818cf8",
  buttonBg: "#09090b",
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
              <p>
                Synthos · <a href="https://${BRAND.domain}">${BRAND.domain}</a> · <a href="mailto:${BRAND.email}">${BRAND.email}</a>
              </p>
              <p style="margin-top:4px;">
                This message was sent because you submitted a project request or are part of an active project.
              </p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatList(items: string[]): string {
  if (!items || items.length === 0) return ""
  return `<ul>${items.map((item) => `li>${escapeHtml(item)}</li>`).join("")}</ul>`
}

export function buildContactReportEmail(params: {
  clientName: string
  projectName: string
  summary: string
  publicUrl?: string
}) {
  const title = `Contact report ready: ${params.projectName}`
  const body = `
    <p class="greeting">Hi ${escapeHtml(params.clientName)},</p>
    <p>Thank you for the discovery call. Here is a summary of what we discussed for <strong>${escapeHtml(params.projectName)}</strong>.</p>
    
    <div class="meta">
      <div style="font-weight: 600; margin-bottom: 6px;">Summary</div>
      <div style="line-height: 1.6;">${escapeHtml(params.summary)}</div>
    </div>
    
    <p>We are now preparing the production plan and proposal. We will be in touch shortly with the next steps.</p>
    
    ${
      params.publicUrl
        ? `
    <div class="actions">
      <a href="${escapeHtml(params.publicUrl)}" class="btn">View Project Status →</a>
    </div>
    `
        : ""
    }
  `
  return { subject: title, html: wrap(title, body) }
}

export function buildProposalReadyEmail(params: {
  clientName: string
  projectName: string
  proposalUrl: string
  overview?: string
}) {
  const title = `Proposal ready for review: ${params.projectName}`
  const body = `
    <p class="greeting">Hi ${escapeHtml(params.clientName)},</p>
    <p>We have completed the proposal for <strong>${escapeHtml(params.projectName)}</strong>.</p>
    
    ${
      params.overview
        ? `
    <div class="meta">
      <div style="font-weight: 600; margin-bottom: 6px;">Overview</div>
      <div>${escapeHtml(params.overview)}</div>
    </div>
    `
        : ""
    }
    
    <p>Please review the proposal details and let us know if you approve or have any feedback.</p>
    
    <div class="actions">
      <a href="${escapeHtml(params.proposalUrl)}" class="btn">Review Proposal & Approve →</a>
    </div>
  `
  return { subject: title, html: wrap(title, body) }
}

export function buildQuoteReadyEmail(params: {
  clientName: string
  projectName: string
  quoteUrl: string
  total?: string
}) {
  const title = `Quote ready for review: ${params.projectName}`
  const body = `
    <p class="greeting">Hi ${escapeHtml(params.clientName)},</p>
    <p>The cost estimate for <strong>${escapeHtml(params.projectName)}</strong> is now ready.</p>
    
    ${
      params.total
        ? `
    <div class="meta">
      <div style="font-weight: 600; margin-bottom: 4px;">Total Estimated Investment</div>
      <div style="font-size: 18px; font-weight: 700; color: ${BRAND.accent};">${escapeHtml(params.total)}</div>
    </div>
    `
        : ""
    }
    
    <p>Please review the itemized quote breakdown at your convenience.</p>
    
    <div class="actions">
      <a href="${escapeHtml(params.quoteUrl)}" class="btn">Review Quote & Approve →</a>
    </div>
  `
  return { subject: title, html: wrap(title, body) }
}

export function buildWorkflowCompleteEmail(params: {
  clientName: string
  projectName: string
  projectUrl: string
}) {
  const title = `Project kickoff complete: ${params.projectName}`
  const body = `
    <p class="greeting">Hi ${escapeHtml(params.clientName)},</p>
    <p>All initial steps for <strong>${escapeHtml(params.projectName)}</strong> have been generated and configured.</p>
    <p>You can access your project dashboard anytime to track milestones, deliverables, and updates.</p>
    
    <div class="actions">
      <a href="${escapeHtml(params.projectUrl)}" class="btn">Open Project Dashboard →</a>
    </div>
  `
  return { subject: title, html: wrap(title, body) }
}
