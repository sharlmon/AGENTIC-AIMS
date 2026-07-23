"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import "@/components/app/admin.css"

type Message = {
  id: string
  senderName: string
  senderRole: string
  subject: string
  body: string
  createdAt: string
}

type ProjectData = {
  id: string
  name: string
  type: string
  stage: string
  status: string
  progress: number
  client: string
  clientRef: any
  createdAt: string
  brief: any
  call: any
  projectBrief: any
  proposal: any
  quote: any
  deliverables: any[]
  messages: Message[]
}

const STAGES = [
  "brief", "call", "contactReport", "productionMeeting",
  "transcript", "understanding", "projectBrief",
  "workshop", "synthesis", "proposal", "quote", "approval",
]

export default function PublicProjectPage() {
  const params = useParams()
  const token = params.token as string
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [msgName, setMsgName] = useState("")
  const [msgEmail, setMsgEmail] = useState("")
  const [msgSubject, setMsgSubject] = useState("")
  const [msgBody, setMsgBody] = useState("")
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [msgError, setMsgError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/public/project/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setData)
      .catch(() => setError("This project link is invalid or has expired."))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!user || !isLoaded) return
    const fullName = user.fullName || ""
    const email = user.primaryEmailAddress?.emailAddress || ""
    setMsgName((prev) => prev || fullName)
    setMsgEmail((prev) => prev || email)
  }, [user, isLoaded])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsgSending(true)
    setMsgError(null)
    setMsgSent(false)

    try {
      const res = await fetch(`/api/public/project/${token}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: msgName, email: msgEmail, subject: msgSubject, message: msgBody }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to send message" }))
        throw new Error(err.error || "Failed to send message")
      }

      setMsgSent(true)
      setMsgName("")
      setMsgEmail("")
      setMsgSubject("")
      setMsgBody("")
    } catch (err) {
      setMsgError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setMsgSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Loading…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--rejected)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {error || "Not found"}
      </div>
    )
  }

  const stageIndex = STAGES.indexOf(data.stage)
  const currentStageLabel = data.stage.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", color: "var(--ink-2)", lineHeight: 1.6 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--signal)", marginBottom: 12 }}>
            {data.type}
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
            {data.name}
          </h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)", marginBottom: 8 }}>
            {user ? (
              <>Welcome, <span style={{ color: "var(--ink)", fontWeight: 600 }}>{user.fullName || user.primaryEmailAddress?.emailAddress}</span></>
            ) : (
              <>Client: <span style={{ color: "var(--ink-2)" }}>{data.client}</span></>
            )}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span className={`admin-badge admin-badge-${data.status}`}>{data.status}</span>
            <span className="chip">{currentStageLabel}</span>
            <span className="tiny muted">{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
            Progress
          </h2>
          <div style={{ width: "100%", height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${data.progress}%`, height: "100%", background: "var(--signal)", borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
          <p className="tiny muted" style={{ marginTop: 6 }}>{data.progress}% complete</p>
        </div>

        {data.brief && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              Creative Brief
            </h2>
            <div style={{ border: "1px solid var(--line)", padding: "24px 28px" }}>
              {data.brief.title && <p style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 12, fontSize: "1rem" }}>{data.brief.title}</p>}
              {data.brief.businessObjective && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Objective</div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{data.brief.businessObjective}</p>
                </div>
              )}
              {data.brief.audience && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Audience</div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{data.brief.audience}</p>
                </div>
              )}
              {data.brief.deliverables && data.brief.deliverables.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Deliverables</div>
                  <ul style={{ paddingLeft: 20, fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                    {data.brief.deliverables.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.brief.timeline && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Timeline</div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{data.brief.timeline}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {data.call && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              Discovery Call
            </h2>
            <div style={{ border: "1px solid var(--line)", padding: "24px 28px" }}>
              {data.call.date && <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 8 }}><strong>Date:</strong> {new Date(data.call.date).toLocaleDateString()}</p>}
              {data.call.summary && <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{data.call.summary}</p>}
            </div>
          </div>
        )}

        {data.projectBrief && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              Project Brief
            </h2>
            <div style={{ border: "1px solid var(--line)", padding: "24px 28px" }}>
              {data.projectBrief.summary && <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 16 }}>{data.projectBrief.summary}</p>}
              {data.projectBrief.deliverables && data.projectBrief.deliverables.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Deliverables</div>
                  <ul style={{ paddingLeft: 20, fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                    {data.projectBrief.deliverables.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.projectBrief.timeline && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Timeline</div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{data.projectBrief.timeline}</p>
                </div>
              )}
              {data.projectBrief.successCriteria && data.projectBrief.successCriteria.length > 0 && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Success Criteria</div>
                  <ul style={{ paddingLeft: 20, fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                    {data.projectBrief.successCriteria.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {(data.proposal || data.quote) && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              Proposal & Quote
            </h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {data.proposal && data.proposal.sentToClient && (
                <Link href={`/public/approve/${data.proposal.publicToken}`} className="btn btn-signal" style={{ textDecoration: "none" }}>
                  Review Proposal
                </Link>
              )}
              {data.quote && data.quote.sentToClient && (
                <Link href={`/public/approve/${data.quote.publicToken}`} className="btn btn-signal" style={{ textDecoration: "none" }}>
                  Review Quote
                </Link>
              )}
            </div>
          </div>
        )}

        {data.deliverables && data.deliverables.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              Deliverables
            </h2>
            <div style={{ border: "1px solid var(--line)", padding: "24px 28px" }}>
              <ul style={{ paddingLeft: 20, fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 8 }}>
                {data.deliverables.map((d: any, i: number) => {
                  const label = typeof d === "string" ? d : d?.name || d?.title || JSON.stringify(d)
                  const url = typeof d === "object" ? (d?.url || d?.link || d?.href) : null
                  return (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--signal)" }}>›</span>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer" style={{ color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</a>
                      ) : (
                        <span style={{ color: "var(--ink)" }}>{label}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        {data.messages && data.messages.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              Messages
            </h2>
            <div style={{ border: "1px solid var(--line)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              {data.messages.map((m) => (
                <div key={m.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{m.senderName}</span>
                    <span className="tiny muted">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  {m.subject && <p style={{ fontWeight: 500, color: "var(--ink-2)", marginBottom: 4, fontSize: "0.88rem" }}>{m.subject}</p>}
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 12, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
            Send a Message
          </h2>
          <div style={{ border: "1px solid var(--line)", padding: "24px 28px" }}>
            {msgSent ? (
              <div style={{ padding: "16px 20px", background: "var(--approved-soft)", border: "1px solid var(--approved)", color: "var(--approved)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Message sent. We will be in touch shortly.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {msgError && (
                  <div style={{ padding: "16px 20px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {msgError}
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-grid-2">
                    <div className="field">
                      <label>Name <span style={{ color: "var(--signal)" }}>*</span></label>
                      <input className="admin-input" value={msgName} onChange={(e) => setMsgName(e.target.value)} placeholder="Your name" required />
                    </div>
                    <div className="field">
                      <label>Email <span style={{ color: "var(--signal)" }}>*</span></label>
                      <input className="admin-input" type="email" value={msgEmail} onChange={(e) => setMsgEmail(e.target.value)} placeholder="you@company.com" required />
                    </div>
                  </div>
                  <div className="field">
                    <label>Subject</label>
                    <input className="admin-input" value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} placeholder="Subject" />
                  </div>
                  <div className="field">
                    <label>Message <span style={{ color: "var(--signal)" }}>*</span></label>
                    <textarea className="admin-input" value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="How can we help?" rows={5} required style={{ resize: "vertical", minHeight: 120 }} />
                  </div>
                </div>
                <button type="submit" className="btn btn-signal" disabled={msgSending}>
                  {msgSending ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
