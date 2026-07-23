const BRAND = {
  name: "Synthos",
  domain: "synthos.dev",
  email: "info@synthos.dev",
  bg: "#09090b",
  cardBg: "#121218",
  headerBg: "#0f172a",
  border: "rgba(255, 255, 255, 0.1)",
  blueBorder: "rgba(59, 130, 246, 0.3)",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  accent: "#3b82f6",
  indigoAccent: "#818cf8",
  buttonBg: "#ffffff",
  buttonText: "#09090b",
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
    body { margin: 0; padding: 0; background-color: ${BRAND.bg}; color: ${BRAND.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    img { border: 0; outline: none; text-decoration: none; }
    a { color: ${BRAND.accent}; text-decoration: none; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
    .header { background: ${BRAND.headerBg}; padding: 28px 36px; border-bottom: 1px solid ${BRAND.blueBorder}; }
    .brand-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${BRAND.indigoAccent}; display: block; margin-bottom: 6px; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
    .header p { color: #94a3b8; font-size: 13px; margin: 4px 0 0; }
    .content { padding: 32px 36px; }
    .greeting { font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 14px; }
    .content p { line-height: 1.65; margin: 0 0 16px; font-size: 14px; color: ${BRAND.muted}; }
    .meta-box { background: rgba(255, 255, 255, 0.03); border: 1px solid ${BRAND.blueBorder}; border-radius: 14px; padding: 20px; margin: 24px 0; }
    .meta-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${BRAND.accent}; margin-bottom: 8px; }
    .meta-text { font-size: 14px; color: #e4e4e7; line-height: 1.6; }
    .btn { display: inline-block; padding: 13px 26px; border-radius: 10px; background: ${BRAND.buttonBg}; color: ${BRAND.buttonText}; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.2s ease; }
    .actions { margin-top: 28px; }
    .footer { padding: 24px 36px; border-top: 1px solid ${BRAND.border}; background: rgba(0,0,0,0.2); }
    .footer p { color: #71717a; font-size: 12px; margin: 0; line-height: 1.5; }
  </style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <span class="brand-badge">✦ Synthos Creative Intelligence</span>
              <h1>${escapeHtml(BRAND.name)} Workspace</h1>
            </div>

            ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(preheader)}</div>` : ""}

            <div class="content">
              ${body}
            </div>

            <div class="footer">
              <p>
                Synthos Platform · <a href="https://${BRAND.domain}">${BRAND.domain}</a> · <a href="mailto:${BRAND.email}">${BRAND.email}</a>
              </p>
              <p style="margin-top:6px;">
                Automated project notification sent from your active workspace.
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

export function buildContactReportEmail(params: {
  clientName: string
  projectName: string
  summary: string
  publicUrl?: string
}) {
  const title = `Contact report ready: ${params.projectName}`
  const body = `
    <div class="greeting">Hi ${escapeHtml(params.clientName)},</div>
    <p>Thank you for the discovery alignment session. Here is your structured contact report summary for <strong>${escapeHtml(params.projectName)}</strong>.</p>
    
    <div class="meta-box">
      <div class="meta-title">Executive Summary</div>
      <div class="meta-text">${escapeHtml(params.summary)}</div>
    </div>
    
    <p>Our AI agents are currently compiling your customized proposal and cost breakdown.</p>
    
    ${
      params.publicUrl
        ? `
    <div class="actions">
      <a href="${escapeHtml(params.publicUrl)}" class="btn">View Project Workspace →</a>
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
    <div class="greeting">Hi ${escapeHtml(params.clientName)},</div>
    <p>Your customized project proposal for <strong>${escapeHtml(params.projectName)}</strong> has been generated and is ready for review.</p>
    
    ${
      params.overview
        ? `
    <div class="meta-box">
      <div class="meta-title">Proposal Overview</div>
      <div class="meta-text">${escapeHtml(params.overview)}</div>
    </div>
    `
        : ""
    }
    
    <p>Please click below to review the interactive scope, timeline, and deliverables.</p>
    
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
  const title = `Cost estimate ready: ${params.projectName}`
  const body = `
    <div class="greeting">Hi ${escapeHtml(params.clientName)},</div>
    <p>The formal investment breakdown for <strong>${escapeHtml(params.projectName)}</strong> is now ready for your review.</p>
    
    ${
      params.total
        ? `
    <div class="meta-box">
      <div class="meta-title">Total Estimated Investment</div>
      <div style="font-size: 22px; font-weight: 700; color: #3b82f6; margin-top: 4px;">${escapeHtml(params.total)}</div>
    </div>
    `
        : ""
    }
    
    <p>Review the itemized milestone schedule and payment terms below.</p>
    
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
    <div class="greeting">Hi ${escapeHtml(params.clientName)},</div>
    <p>All initial setup steps for <strong>${escapeHtml(params.projectName)}</strong> have been successfully configured.</p>
    <p>You can access your project portal anytime to monitor progress, milestones, and team updates.</p>
    
    <div class="actions">
      <a href="${escapeHtml(params.projectUrl)}" class="btn">Open Project Workspace →</a>
    </div>
  `
  return { subject: title, html: wrap(title, body) }
}
