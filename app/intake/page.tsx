"use client"

import { useState, useEffect, useRef } from "react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Panel, Empty } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

const TYPES = [
  "Brand & Campaign",
  "Film & Motion",
  "Web & Product",
  "Strategy & Campaign",
]

const STAGE_LABELS: Record<string, string> = {
  brief: "Brief analyzed",
  call: "Discovery call scheduled",
  contactReport: "Contact report generated",
  productionMeeting: "Production meeting planned",
  proposal: "Proposal generated",
  quote: "Quote generated",
  approval: "Awaiting client approval",
}

export default function IntakePage() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", type: "Brand & Campaign",
    title: "", objective: "", audience: "", direction: "", budget: "", timeline: "", context: ""
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<{ name: string; title: string; projectId?: string } | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<{ stage: string; steps: any[] } | null>(null)
  const [polling, setPolling] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    const storedId = sessionStorage.getItem("synthos_last_project_id")
    if (storedId && !initialized.current) {
      initialized.current = true
      setSubmittedData({ name: "", title: "", projectId: storedId })
      setStatus("success")
      setPolling(true)
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name || !form.email || !form.title) {
      setError("Name, email, and project title are required.")
      setStatus("error")
      return
    }

    setStatus("loading")
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit request")
      }

      const data = await res.json()
      setStatus("success")
      setSubmittedData({ name: form.name, title: form.title, projectId: data.projectId })
      sessionStorage.setItem("synthos_last_project_id", data.projectId)
      setForm({ name: "", company: "", email: "", phone: "", type: "Brand & Campaign", title: "", objective: "", audience: "", direction: "", budget: "", timeline: "", context: "" })
      setPolling(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setStatus("error")
    }
  }

  const resetForm = () => {
    setStatus("idle")
    setWorkflowStatus(null)
    setPolling(false)
    setSubmittedData(null)
    sessionStorage.removeItem("synthos_last_project_id")
  }

  useEffect(() => {
    if (!polling || !submittedData?.projectId) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/projects/${submittedData.projectId}/workflow/status`)
        if (res.ok) {
          const data = await res.json()
          const wf = data.project?.aiWorkflowStatus || {}
          const steps = Object.entries(wf).map(([stage, info]: [string, any]) => ({
            stage,
            step: info.step,
            status: info.status,
            updatedAt: info.updatedAt,
          }))
          setWorkflowStatus({ stage: wf.currentStage || "brief", steps })

          if (wf.currentStage === "approval" || wf.currentStage === "complete") {
            setPolling(false)
            if (pollRef.current) clearInterval(pollRef.current)
          }
        }
      } catch (e) {
        console.error("Polling error:", e)
      }
    }

    poll()
    pollRef.current = setInterval(poll, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [polling, submittedData?.projectId])

  const currentStageLabel = STAGE_LABELS[workflowStatus?.stage || "brief"] || "Processing..."

  return (
    <PageWrap>
      <PageHead
        eyebrow="Start a project"
        title="Tell us about your project"
        desc="Fill out the form below or use the microphone buttons to speak your answers. Our AI will prepare a brief and schedule a discovery call."
      />

      {status === "success" ? (
        <Panel>
          <div style={{ padding: 40, textAlign: "center" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: 12 }}>Request received</h3>
            <p className="muted" style={{ maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Thanks, {submittedData?.name || "there"}. We&apos;ve received your project request for <strong>{submittedData?.title || "your project"}</strong>.
            </p>

            <div style={{ marginTop: 24, padding: 20, background: "var(--surface-2)", border: "1px solid var(--line)", maxWidth: 480, margin: "24px auto 0" }}>
              <p style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 10 }}>AI Workflow</p>
              <p style={{ fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.6, marginBottom: 12 }}>{currentStageLabel}</p>

              {workflowStatus && workflowStatus.steps.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                  {workflowStatus.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem" }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%", background: step.status === "completed" ? "var(--signal)" : step.status === "in_progress" ? "var(--signal-soft)" : "var(--line)", flexShrink: 0
                      }} />
                      <span style={{ color: "var(--ink-2)", textTransform: "capitalize" }}>{step.stage.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span style={{ color: "var(--ink-3)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>{step.status === "completed" ? "✓" : step.status === "in_progress" ? "..." : "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn-ghost btn-sm" style={{ marginTop: 20 }} onClick={resetForm}>
              Submit another request
            </button>
          </div>
        </Panel>
      ) : (
        <form onSubmit={submit}>
          <Panel>
            <div style={{ padding: 24 }} className="stack gap-4">
              <div className="form-grid-2">
                <div className="field"><label>Your Name *</label><VoiceInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="joshua " /></div>
                <div className="field"><label>Company</label><VoiceInput value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Inc" /></div>
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label>Email *</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="joshua@acme.com" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0123" />
                </div>
              </div>
              <div className="field">
                <label>Project Type</label>
                <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field"><label>Project Title *</label><VoiceInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Brand Refresh 2026" style={{ width: "100%" }} /></div>
              <div className="field"><label>Business Objective</label><VoiceInput value={form.objective} onChange={(v) => setForm({ ...form, objective: v })} placeholder="What are you trying to achieve?" rows={3} style={{ width: "100%" }} /></div>
              <div className="field"><label>Target Audience</label><VoiceInput value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} placeholder="e.g. Gen Z, professionals, SMEs" rows={3} style={{ width: "100%" }} /></div>
              <div className="field"><label>Creative Direction</label><VoiceInput value={form.direction} onChange={(v) => setForm({ ...form, direction: v })} placeholder="Any style, tone, or direction preferences?" rows={3} style={{ width: "100%" }} /></div>
              <div className="form-grid-2">
                <div className="field"><label>Budget Range</label><VoiceInput value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="e.g. $50,000 - $100,000" /></div>
                <div className="field"><label>Timeline</label><VoiceInput value={form.timeline} onChange={(v) => setForm({ ...form, timeline: v })} placeholder="e.g. 8-12 weeks" /></div>
              </div>
              <div className="field"><label>Additional Context</label><VoiceInput value={form.context} onChange={(v) => setForm({ ...form, context: v })} placeholder="Anything else we should know?" rows={3} style={{ width: "100%" }} /></div>

              {error && <p style={{ color: "#c62828", fontSize: "0.82rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{error}</p>}

              <button type="submit" className="btn btn-signal" disabled={status === "loading"} style={{ alignSelf: "flex-start" }}>
                {status === "loading" ? "Submitting…" : "Submit Project Request →"}
              </button>
            </div>
          </Panel>
        </form>
      )}
    </PageWrap>
  )
}
