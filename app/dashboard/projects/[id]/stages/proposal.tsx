"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/types"
import { Panel, PanelHeader, AttrTag, StatusPill, Empty } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

export function ProposalStage({ project }: { project: Project }) {
  const p = project.proposal
  const [editing, setEditing] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [form, setForm] = useState({
    clientDetails: p?.clientDetails || "",
    overview: p?.overview || "",
    problem: p?.problem || "",
    solution: p?.solution || "",
    scope: (p?.scope || []).join("\n"),
    deliverables: (p?.deliverables || []).join("\n"),
    timeline: p?.timeline || "",
    team: (p?.team || []).join("\n"),
    investment: p?.investment || "",
    terms: p?.terms || "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/proposal-templates")
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => {})
  }, [])

  const loadTemplate = (tpl: any) => {
    setForm({
      clientDetails: tpl.data.clientDetails || "",
      overview: tpl.data.overview || "",
      problem: tpl.data.problem || "",
      solution: tpl.data.solution || "",
      scope: (tpl.data.scope || []).join("\n"),
      deliverables: (tpl.data.deliverables || []).join("\n"),
      timeline: tpl.data.timeline || "",
      team: (tpl.data.team || []).join("\n"),
      investment: tpl.data.investment || "",
      terms: tpl.data.terms || "",
    })
    setEditing(true)
  }

  const save = async () => {
    setLoading(true)
    try {
      const payload = {
        clientDetails: form.clientDetails, overview: form.overview, problem: form.problem, solution: form.solution,
        scope: form.scope.split("\n").filter(Boolean),
        deliverables: form.deliverables.split("\n").filter(Boolean),
        timeline: form.timeline, team: form.team.split("\n").filter(Boolean),
        investment: form.investment, terms: form.terms,
        sections: [{ title: "Context", body: form.overview, attr: "ai" }],
        status: p?.status || "review",
      }
      await fetch(`/api/projects/${project.id}/proposal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      setEditing(false)
      window.location.reload()
    } catch (e) {
      console.error("Failed to save proposal:", e)
    } finally {
      setLoading(false)
    }
  }

  if (!p) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 8" title="Proposal" desc="The system will generate and send the proposal automatically." />
        <div style={{ padding: 24 }}><Empty title="No proposal yet" hint="The proposal will be generated automatically by the AI workflow." /></div>
      </Panel>
    )
  }

  if (editing) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 8" title="Edit Proposal" />
        <div className="stack gap-3" style={{ padding: 24 }}>
          {templates.length > 0 && (
            <div className="field">
              <label>Start from template</label>
              <select className="select" value="" onChange={(e) => e.target.value && loadTemplate(templates.find((t: any) => t.id === e.target.value))}>
                <option value="">Select a template...</option>
                {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="field"><label>Client details</label><input className="input" value={form.clientDetails} onChange={(e) => setForm({ ...form, clientDetails: e.target.value })} /></div>
          <div className="field"><label>Overview</label><VoiceInput value={form.overview} onChange={(val) => setForm({ ...form, overview: val })} /></div>
          <div className="field"><label>Problem</label><VoiceInput value={form.problem} onChange={(val) => setForm({ ...form, problem: val })} /></div>
          <div className="field"><label>Solution</label><VoiceInput value={form.solution} onChange={(val) => setForm({ ...form, solution: val })} /></div>
          <div className="field"><label>Scope (one per line)</label><VoiceInput value={form.scope} onChange={(val) => setForm({ ...form, scope: val })} /></div>
          <div className="field"><label>Deliverables (one per line)</label><VoiceInput value={form.deliverables} onChange={(val) => setForm({ ...form, deliverables: val })} /></div>
          <div className="field"><label>Team (one per line)</label><VoiceInput value={form.team} onChange={(val) => setForm({ ...form, team: val })} /></div>
          <div className="form-grid-2">
            <div className="field"><label>Investment</label><input className="input" value={form.investment} onChange={(e) => setForm({ ...form, investment: e.target.value })} /></div>
            <div className="field"><label>Terms</label><input className="input" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} /></div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-signal btn-sm" onClick={save} disabled={loading}>Save changes</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <div className="stack gap-5">
      <Panel>
        <PanelHeader eyebrow="Stage 8" title="Proposal" desc="AI-generated proposal. Sent to client for review." actions={
          <div className="row gap-2">
            <StatusPill status={p.status} />
            <span className="chip" style={{ fontSize: "0.72rem" }}>{(p as any).sentToClient ? "Sent to client" : "Draft"}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
          </div>
        } />
        <div className="stack gap-4" style={{ padding: 24 }}>
          <div className="proposal-meta">
            <Field label="Client details" value={p.clientDetails} />
            <Field label="Investment" value={p.investment} />
            <Field label="Timeline" value={p.timeline} />
          </div>
          {p.sections?.length > 0 && (
            <div className="stack gap-3">
              {p.sections.map((s: any, i: number) => (
                <div key={i} className="proposal-section">
                  <div className="row between">
                    <h4 style={{ fontSize: "0.98rem" }}>{s.title}</h4>
                    <AttrTag attr={s.attr} />
                  </div>
                  <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", marginTop: 6 }}>{s.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <p style={{ color: "var(--ink-2)", fontSize: "0.92rem" }}>{value || "—"}</p>
    </div>
  )
}
