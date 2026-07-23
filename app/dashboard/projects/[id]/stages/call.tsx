"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/lib/types"
import { Panel, PanelHeader, Empty } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

export function CallStage({ project }: { project: Project }) {
  const c = project.call
  const hasCall = c && c.participants?.length > 0
  const [editing, setEditing] = useState(!hasCall)
  const [form, setForm] = useState({ date: c?.date || "", duration: c?.duration || "", participants: (c?.participants || []).join("\n"), summary: c?.summary || "", meetingSource: c?.meetingSource || "embedded", transcript: c?.transcript || "" })
  const [joining, setJoining] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteSource, setPasteSource] = useState(c?.meetingSource || "embedded")
  const [pasteText, setPasteText] = useState(c?.transcript || "")
  const [pasteSaving, setPasteSaving] = useState(false)
  const router = useRouter()

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/call`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: form.date, duration: form.duration, participants: form.participants.split("\n").filter(Boolean), summary: form.summary, meetingSource: form.meetingSource, transcript: form.transcript }),
      })
      if (!res.ok) throw new Error("Failed to save call")
      setEditing(false)
      router.refresh()
      setTimeout(() => {
        fetch(`/api/projects/${project.id}/workflow/advance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auto" }) })
          .then(() => router.refresh())
          .catch((e) => console.error("Failed to advance workflow:", e))
      }, 500)
    } catch (e) {
      console.error("Failed to save call:", e)
    } finally {
      setSaving(false)
    }
  }

  const saveTranscriptOnly = async () => {
    setPasteSaving(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/call`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingSource: pasteSource, transcript: pasteText }),
      })
      if (!res.ok) throw new Error("Failed to save transcript")
      setPasteMode(false)
      router.refresh()
    } catch (e) {
      console.error("Failed to save transcript:", e)
    } finally {
      setPasteSaving(false)
    }
  }

  const autoFillCall = async () => {
    setSaving(true)
    try {
      await fetch(`/api/projects/${project.id}/auto-fill-call`, { method: "POST" })
      router.refresh()
    } catch (e) {
      console.error("Failed to auto-fill call:", e)
    } finally {
      setSaving(false)
    }
  }

  const joinMeeting = async () => {
    setJoining(true)
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, title: project.name }),
    })
    const data = await res.json()
    if (data.url) {
      window.open(data.url, "_blank")
    }
    setJoining(false)
  }

  if (editing) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 2" title={hasCall ? "Edit Client Call" : "Schedule Client Call"} />
        <div className="brief-grid" style={{ padding: 24 }}>
          <Field label="Meeting date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          <Field label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          <VoiceInput label="Participants (one per line)" value={form.participants} onChange={(v) => setForm({ ...form, participants: v })} wide textarea />
          <VoiceInput label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} wide textarea />
          <div className="field"><label>Meeting source</label>
            <select className="input" value={form.meetingSource} onChange={(e) => setForm({ ...form, meetingSource: e.target.value })}>
              <option value="embedded">AIMS Embedded (Daily.co)</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="google-meet">Google Meet</option>
              <option value="in-person">In Person</option>
              <option value="phone">Phone</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <VoiceInput label="AI Agent Transcript / Meeting Notes" value={form.transcript} onChange={(v) => setForm({ ...form, transcript: v })} wide textarea />
          <div style={{ gridColumn: "1 / -1" }} className="row gap-2">
            <button className="btn btn-signal btn-sm" onClick={save}>Save call</button>
            {hasCall && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>}
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <div className="stack gap-5">
      {pasteMode ? (
        <Panel>
          <PanelHeader eyebrow="Stage 2" title="Paste External Meeting Transcript" desc="Paste the AI-captured transcript from your external meeting (Zoom, Teams, Granola, etc.)." actions={<button className="btn btn-ghost btn-sm" onClick={() => setPasteMode(false)}>Cancel</button>} />
          <div className="brief-grid" style={{ padding: 24 }}>
            <div className="field"><label>Meeting source</label>
              <select className="input" value={pasteSource} onChange={(e) => setPasteSource(e.target.value)}>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="google-meet">Google Meet</option>
                <option value="in-person">In Person</option>
                <option value="phone">Phone</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <VoiceInput label="Paste full transcript / AI meeting capture" value={pasteText} onChange={(v) => setPasteText(v)} wide textarea />
            <div style={{ gridColumn: "1 / -1" }} className="row gap-2">
              <button className="btn btn-signal btn-sm" onClick={saveTranscriptOnly} disabled={pasteSaving || !pasteText.trim()}>{pasteSaving ? "Saving…" : "Save transcript"}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPasteMode(false)}>Cancel</button>
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <Panel>
            <PanelHeader eyebrow="Stage 2" title="Client Call" desc="The discovery conversation." actions={<div className="row gap-2"><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button><button className="btn btn-ghost btn-sm" onClick={() => { window.location.href = `/dashboard/meetings?project=${project.id}` }}>External Meeting</button><button className="btn btn-signal btn-sm" onClick={joinMeeting} disabled={joining}>{joining ? "Creating..." : "Join Meeting"}</button></div>} />
            <div className="brief-grid">
              <Field label="Meeting date" value={c?.date} />
              <Field label="Duration" value={c?.duration} />
              <Field label="Participants" value={(c?.participants || []).join(", ")} wide />
              <Field label="Meeting source" value={c?.meetingSource ? formatMeetingSource(c?.meetingSource) : "—"} />
              <Field label="Transcript / AI Capture" value={c?.transcript || ""} wide />
            </div>
            {c?.transcript && (
              <div style={{ padding: "0 24px 24px" }}>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", color: "var(--ink-2)", background: "var(--surface-2)", padding: 16, borderRadius: 8, lineHeight: 1.6, maxHeight: 400, overflow: "auto" }}>{c.transcript}</pre>
              </div>
            )}
          </Panel>
          {project.brief && (
            <Panel>
              <PanelHeader title="Before the call" desc="Focus areas from the brief." />
              <ul className="stack gap-2" style={{ padding: "8px 24px 24px" }}>
                {(project.brief.aiAnalysis?.questions || []).map((q: string, i: number) => (
                  <li key={i} className="analysis-item" style={{ background: "var(--signal-soft)" }}>{q}</li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}

function Field({ label, value, onChange, wide, textarea }: { label: string; value: string; onChange?: (v: string) => void; wide?: boolean; textarea?: boolean }) {
  const input = onChange ? (
    textarea ? <textarea className="textarea" value={value} onChange={(e) => onChange?.(e.target.value)} /> : <input className="input" value={value} onChange={(e) => onChange?.(e.target.value)} />
  ) : <p style={{ color: "var(--ink-2)", fontSize: "0.92rem" }}>{value || "—"}</p>
  return <div className="field" style={{ gridColumn: wide ? "1 / -1" : undefined }}><label>{label}</label>{input}</div>
}

function formatMeetingSource(source: string): string {
  const map: Record<string, string> = {
    embedded: "AIMS Embedded (Daily.co)",
    zoom: "Zoom",
    teams: "Microsoft Teams",
    "google-meet": "Google Meet",
    "in-person": "In Person",
    phone: "Phone",
    custom: "Custom",
  }
  return map[source] || source
}
