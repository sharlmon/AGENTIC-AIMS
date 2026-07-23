"use client"

import { useState } from "react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { VoiceInput } from "@/components/app/VoiceInput"

type FormState = {
  name: string
  email: string
  company: string
  subject: string
  message: string
}

const INITIAL: FormState = {
  name: "",
  email: "",
  company: "",
  subject: "",
  message: "",
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
    const value = typeof e === "string" ? e : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("All required fields must be filled.")
      setStatus("error")
      return
    }

    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send message.")
      }

      setStatus("success")
      setForm(INITIAL)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setStatus("error")
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid var(--line-strong)",
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  }

  return (
    <PageWrap>
      <PageHead
        eyebrow="Contact"
        title="Get in touch"
        desc="Have a question or want to see AIMS in action? We&apos;d love to hear from you."
      />

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className="contact-grid">
          {/* Left column — contact info */}
          <div style={{ padding: "36px 32px", borderRight: "1px solid var(--line)" }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Email</div>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", marginBottom: 28 }}>hello@aims.studio</p>

            <div className="section-title" style={{ marginBottom: 10 }}>Sales &amp; Partnerships</div>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", marginBottom: 28 }}>partners@aims.studio</p>

            <div className="section-title" style={{ marginBottom: 10 }}>Support</div>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", marginBottom: 28 }}>support@aims.studio</p>

            <div className="section-title" style={{ marginBottom: 10 }}>Location</div>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", marginBottom: 28 }}>Remote-first, serving creative teams worldwide.</p>

            <div style={{ padding: "20px 22px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Response Time</div>
              <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
                We usually respond within one business day. For urgent matters, please include &quot;URGENT&quot; in the subject line.
              </p>
            </div>
          </div>

          {/* Right column — form */}
          <div style={{ padding: "36px 32px" }}>
            <form onSubmit={submit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={labelStyle}>Name <span style={{ color: "var(--signal)" }}>*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your full name"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--signal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line-strong)")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email <span style={{ color: "var(--signal)" }}>*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@company.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--signal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line-strong)")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={update("company")}
                    placeholder="Agency or client name"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--signal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line-strong)")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Subject <span style={{ color: "var(--signal)" }}>*</span></label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={update("subject")}
                    placeholder="How can we help?"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--signal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line-strong)")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Message <span style={{ color: "var(--signal)" }}>*</span></label>
                  <VoiceInput value={form.message} onChange={(v) => update("message")(v)} placeholder="Tell us about your project, timeline, and goals..." rows={6} style={{ ...inputStyle, resize: "vertical", minHeight: 120, lineHeight: 1.6 }} />
                </div>

                {error && (
                  <p style={{ fontSize: "0.82rem", color: "#c62828", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {error}
                  </p>
                )}

                {status === "success" && (
                  <p style={{ fontSize: "0.82rem", color: "var(--signal-ink)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Message sent successfully. We&apos;ll be in touch.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    background: status === "loading" ? "var(--ink-3)" : "var(--signal)",
                    color: "#fff",
                    border: "2px solid var(--signal)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: status === "loading" ? 0.7 : 1,
                  }}
                >
                  {status === "loading" ? "Sending..." : "Send Message →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "var(--ink-2)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 8,
}
