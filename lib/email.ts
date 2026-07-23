import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Email not sent.")
    return { skipped: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: params.from || process.env.RESEND_FROM_EMAIL || "Synthos <info@lumyn.co.ke>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    if (error) {
      console.error("Resend error:", error)
      return { error }
    }

    return { data }
  } catch (err) {
    console.error("Failed to send email:", err)
    return { error: err }
  }
}
