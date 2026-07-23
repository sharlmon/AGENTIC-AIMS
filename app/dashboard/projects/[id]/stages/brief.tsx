"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/lib/types"
import { Panel, PanelHeader, Confidence, Empty } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

export function BriefStage({ project }: { project: Project }) {
  const b = project.brief
  const [editing, setEditing] = useState(!b || !b.title)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    clientName: b?.clientInfo?.name || "",
    company: b?.clientInfo?.company || "",
    contact: b?.clientInfo?.contact || "",
    industry: b?.clientInfo?.industry || "",
    title: b?.title || "",
    businessObjective: b?.businessObjective || "",
    objectives: (b?.objectives || []).join("\n"),
    audience: b?.audience || "",
    brand: b?.brand || "",
    direction: b?.direction || "",
    deliverables: (b?.deliverables || []).join("\n"),
    budget: b?.budget || "",
    timeline: b?.timeline || "",
    context: b?.context || "",
  })

  const save = async () => {
    const payload = {
      clientName: form.clientName, company: form.company, contact: form.contact, industry: form.industry,
      title: form.title, businessObjective: form.businessObjective,
      objectives: form.objectives.split("\n").filter(Boolean),
      audience: form.audience, brand: form.brand, direction: form.direction,
      deliverables: form.deliverables.split("\n").filter(Boolean),
      budget: form.budget, timeline: form.timeline, context: form.context,
    }
    try {
      await fetch(`/api/projects/${project.id}/brief`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      setEditing(false)
      router.refresh()
      setTimeout(() => autoAdvance(), 500)
    } catch (e) {
      console.error("Failed to save brief:", e)
    }
  }

  const autoFillBrief = async () => {
    setGenerating(true)
    try {
      await fetch(`/api/projects/${project.id}/auto-fill-brief`, { method: "POST" })
      router.refresh()
    } catch (e) {
      console.error("Failed to auto-fill brief:", e)
    } finally {
      setGenerating(false)
    }
  }

  const generateAnalysis = async () => {
    setGenerating(true)
    try {
      await fetch(`/api/projects/${project.id}/generate-brief`, { method: "POST" })
      router.refresh()
    } catch (e) {
      console.error("Failed to generate analysis:", e)
    } finally {
      setGenerating(false)
    }
  }

  const autoAdvance = async () => {
    setGenerating(true)
    try {
      await fetch(`/api/projects/${project.id}/workflow/advance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auto" }) })
      router.refresh()
    } catch (e) {
      console.error("Failed to advance workflow:", e)
    } finally {
      setGenerating(false)
    }
  }

  if (editing) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 1" title={b?.title ? "Edit Creative Brief" : "Create Creative Brief"} />
        <div className="brief-grid" style={{ padding: 24 }}>
          <VoiceInput label="Client name" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} placeholder="e.g. joshua mwendwa" />
          <VoiceInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Inc" />
          <VoiceInput label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="email or phone" />
          <VoiceInput label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} placeholder="Technology" />
          <VoiceInput label="Project title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} wide />
          <VoiceInput label="Business objective" value={form.businessObjective} onChange={(v) => setForm({ ...form, businessObjective: v })} wide />
          <VoiceInput label="Target audience" value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} wide />
          <VoiceInput label="Brand context" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} wide />
          <VoiceInput label="Creative direction" value={form.direction} onChange={(v) => setForm({ ...form, direction: v })} wide />
          <VoiceInput label="Budget" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} />
          <VoiceInput label="Timeline" value={form.timeline} onChange={(v) => setForm({ ...form, timeline: v })} />
          <VoiceInput label="Deliverables (one per line)" value={form.deliverables} onChange={(v) => setForm({ ...form, deliverables: v })} wide textarea />
          <VoiceInput label="Additional context" value={form.context} onChange={(v) => setForm({ ...form, context: v })} wide textarea />
          <div style={{ gridColumn: "1 / -1" }} className="row gap-2">
            <button className="btn btn-signal btn-sm" onClick={save}>Save brief</button>
            {b?.title && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>}
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <div className="stack gap-5">
      <Panel>
        <PanelHeader eyebrow="Stage 1" title="Creative Brief" desc="The client's starting point." actions={<div className="row gap-2"><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button><button className="btn btn-signal btn-sm" onClick={generateAnalysis} disabled={generating}>{generating ? "Analyzing…" : "Generate AI Analysis"}</button><button className="btn btn-ghost btn-sm" onClick={autoFillBrief} disabled={generating}>{generating ? "Filling…" : "Auto-fill Brief"}</button></div>} />
        <div className="brief-grid">
          <Field label="Client" value={b?.clientInfo?.name} />
          <Field label="Company" value={b?.clientInfo?.company} />
          <Field label="Contact" value={b?.clientInfo?.contact} />
          <Field label="Industry" value={b?.clientInfo?.industry} />
          <Field label="Project title" value={b?.title} wide />
          <Field label="Business objective" value={b?.businessObjective} wide />
          <Field label="Target audience" value={b?.audience} wide />
          <Field label="Brand context" value={b?.brand} wide />
          <Field label="Creative direction" value={b?.direction} wide />
          <Field label="Budget" value={b?.budget} />
          <Field label="Timeline" value={b?.timeline} />
          <Field label="Deliverables" value={b?.deliverables?.join(" · ")} wide />
          <Field label="Additional context" value={b?.context} wide />
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="AI analysis" title="What the system read from the brief" desc="The AI distils the brief into signal." actions={<Confidence value={b?.aiAnalysis?.confidence || 0} />} />
        <div className="analysis-grid">
          <Analysis title="What the client wants" items={b?.aiAnalysis?.wants || []} tone="ai" />
          <Analysis title="Key objectives" items={b?.aiAnalysis?.keyObjectives || []} tone="ai" />
          <Analysis title="Important requirements" items={b?.aiAnalysis?.requirements || []} tone="human" />
          <Analysis title="Potential risks" items={b?.aiAnalysis?.risks || []} tone="risk" />
          <Analysis title="Missing information" items={b?.aiAnalysis?.missing || []} tone="warn" />
          <Analysis title="Suggested questions" items={b?.aiAnalysis?.questions || []} tone="signal" />
        </div>
      </Panel>
    </div>
  )
}

function Field({ label, value, onChange, wide, textarea }: { label: string; value: string; onChange?: (v: string) => void; wide?: boolean; textarea?: boolean }) {
  const input = onChange ? (
    textarea ? (
      <textarea className="textarea" value={value} onChange={(e) => onChange?.(e.target.value)} />
    ) : (
      <input className="input" value={value} onChange={(e) => onChange?.(e.target.value)} />
    )
  ) : (
    <p style={{ color: "var(--ink-2)", fontSize: "0.92rem" }}>{value || "—"}</p>
  )
  return (
    <div className="field" style={{ gridColumn: wide ? "1 / -1" : undefined }}>
      <label>{label}</label>
      {input}
    </div>
  )
}

function Analysis({ title, items, tone }: { title: string; items: string[]; tone: "ai" | "human" | "risk" | "warn" | "signal" }) {
  const c = tone === "ai" ? "var(--ai-soft)" : tone === "human" ? "var(--human-soft)" : tone === "risk" ? "var(--rejected-soft)" : tone === "warn" ? "var(--review-soft)" : "var(--signal-soft)"
  return (
    <div className="analysis-block">
      <span className="eyebrow" style={{ color: "var(--ink-3)" }}>{title}</span>
      <ul className="stack gap-2" style={{ marginTop: 8 }}>
        {items.map((it, i) => (
          <li key={i} className="analysis-item" style={{ background: c }}>{it}</li>
        ))}
        {items.length === 0 && <li className="tiny muted">—</li>}
      </ul>
    </div>
  )
}
