"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Panel } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

const STAGE_LABELS: Record<string, string> = {
  brief: "Brief analyzed",
  call: "Discovery call scheduled",
  contactReport: "Contact report generated",
  productionMeeting: "Production meeting planned",
  proposal: "Proposal generated",
  quote: "Quote generated",
  approval: "Awaiting client approval",
}

export default function ExternalMeetingForm({ projects, selectedId }: { projects: any[]; selectedId: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<"existing" | "new">(selectedId ? "existing" : "new")
  const [projectId, setProjectId] = useState(selectedId)
  const [projectName, setProjectName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [company, setCompany] = useState("")
  const [source, setSource] = useState("zoom")
  const [transcript, setTranscript] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [workflowStatus, setWorkflowStatus] = useState<{ stage: string; steps: any[] } | null>(null)
  const [error, setError] = useState("")
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const save = async () => {
    setError("")
    if (!transcript.trim()) return
    if (mode === "new" && (!projectName.trim() || !clientName.trim() || !clientEmail.trim())) {
      setError("Project name, client name, and client email are required.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          projectId: mode === "existing" ? projectId : undefined,
          projectName: mode === "new" ? projectName : undefined,
          clientName: mode === "new" ? clientName : undefined,
          clientEmail: mode === "new" ? clientEmail : undefined,
          company: mode === "new" ? company : undefined,
          source,
          transcript,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      setSaved(true)
      setWorkflowStatus({ stage: "brief", steps: [] })
      if (data.projectId) setProjectId(data.projectId)
    } catch (e: any) {
      setError(e.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!saved || !projectId || !workflowStatus) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/workflow/status`)
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
            if (pollRef.current) clearInterval(pollRef.current)
            setTimeout(() => router.push(`/dashboard/projects/${projectId}`), 2000)
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
  }, [saved, projectId, workflowStatus, router])

  const currentLabel = workflowStatus ? (STAGE_LABELS[workflowStatus.stage] || "Processing...") : "Saving…"
  const isComplete = workflowStatus?.stage === "approval" || workflowStatus?.stage === "complete"

  if (saved) {
    return (
      <Panel>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: 12 }}>Meeting captured ✓</h3>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", marginBottom: 20 }}>{currentLabel}</p>

          <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {workflowStatus?.steps.map((step: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem" }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: step.status === "completed" ? "var(--signal)" : step.status === "in_progress" ? "var(--signal-soft)" : "var(--line)",
                    flexShrink: 0,
                    transition: "background 0.3s",
                  }} />
                  <span style={{ color: "var(--ink-2)", textTransform: "capitalize", flex: 1 }}>
                    {step.stage.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                    {step.status === "completed" ? "✓" : step.status === "in_progress" ? "…" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="muted" style={{ marginTop: 20, fontSize: "0.82rem" }}>
            {isComplete ? "Redirecting to project…" : "AI is processing the full pipeline…"}
          </p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <div style={{ padding: 24 }} className="stack gap-4">
        <div className="field">
          <label>Mode</label>
          <div className="row gap-2">
            <button type="button" className={`btn btn-sm ${mode === "existing" ? "btn-signal" : "btn-ghost"}`} onClick={() => setMode("existing")}>Attach to existing project</button>
            <button type="button" className={`btn btn-sm ${mode === "new" ? "btn-signal" : "btn-ghost"}`} onClick={() => setMode("new")}>Create new project from meeting</button>
          </div>
        </div>

        {mode === "existing" ? (
          <div className="field">
            <label>Project</label>
            <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ maxWidth: 400 }}>
              <option value="">Select a project…</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.client}</option>)}
            </select>
          </div>
        ) : (
          <>
            <div className="form-grid-2">
              <div className="field"><label>Project name *</label><VoiceInput value={projectName} onChange={(v) => setProjectName(v)} placeholder="e.g. Atlas Rebrand" /></div>
              <div className="field"><label>Client name *</label><VoiceInput value={clientName} onChange={(v) => setClientName(v)} placeholder="Client name" /></div>
            </div>
            <div className="form-grid-2">
              <div className="field"><label>Client email *</label><input className="input" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@company.com" /></div>
              <div className="field"><label>Company</label><VoiceInput value={company} onChange={(v) => setCompany(v)} placeholder="Company name" /></div>
            </div>
          </>
        )}

        <div className="field">
          <label>Meeting source</label>
          <select className="select" value={source} onChange={(e) => setSource(e.target.value)} style={{ maxWidth: 400 }}>
            <option value="zoom">Zoom</option>
            <option value="teams">Microsoft Teams</option>
            <option value="google-meet">Google Meet</option>
            <option value="in-person">In Person</option>
            <option value="phone">Phone</option>
            <option value="custom">Custom external</option>
          </select>
        </div>

        <VoiceInput label="Paste full transcript or AI agent capture" value={transcript} onChange={(v) => setTranscript(v)} wide textarea rows={12} />

        {error && <p style={{ color: "#c62828", fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>{error}</p>}

        <button className="btn btn-signal" onClick={save} disabled={saving || !transcript.trim()} style={{ alignSelf: "flex-start" }}>
          {saving ? "Saving…" : "Save meeting →"}
        </button>
      </div>
    </Panel>
  )
}
