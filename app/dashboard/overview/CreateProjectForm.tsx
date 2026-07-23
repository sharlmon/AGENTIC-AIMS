"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VoiceInput } from "@/components/app/VoiceInput"
import { Panel } from "@/components/app/ui"

const CAN_CREATE_ROLES = ["lead", "producer"]
const TYPES = [
  "Brand & Campaign",
  "Film & Motion",
  "Web & Product",
  "Strategy & Campaign",
]

export default function CreateProjectForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [checking, setChecking] = useState(true)

  const [form, setForm] = useState({
    name: "", client: "", email: "", company: "", phone: "", type: "Brand & Campaign",
    title: "", objective: "", audience: "", direction: "", budget: "", timeline: "", context: ""
  })

  useEffect(() => {
    fetch("/api/auth/role")
      .then(res => res.json())
      .then(data => {
        setCanCreate(CAN_CREATE_ROLES.includes(data.role))
        setChecking(false)
      })
      .catch(() => {
        setCanCreate(false)
        setChecking(false)
      })
  }, [])

  const create = async () => {
    if (!form.name || !form.client || !form.title) return
    setLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create project")
      setOpen(false)
      setForm({ name: "", client: "", email: "", company: "", phone: "", type: "Brand & Campaign", title: "", objective: "", audience: "", direction: "", budget: "", timeline: "", context: "" })
      window.location.href = `/dashboard/projects`
    } catch (e) {
      console.error("Failed to create project:", e)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return <button className="btn btn-signal btn-block" disabled>Loading…</button>
  }

  if (!canCreate) {
    return (
      <div className="panel-soft" style={{ padding: 16, textAlign: "center" }}>
        <p className="tiny muted">Only account managers and producers can create projects.</p>
      </div>
    )
  }

  if (!open) {
    return <button className="btn btn-signal btn-block" onClick={() => setOpen(true)}>+ New project</button>
  }

  return (
    <div className="panel-soft" style={{ padding: 16 }}>
      <div className="stack gap-3">
        <div className="form-grid-2">
          <div className="field"><label>Your Name</label><VoiceInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Joshua" /></div>
          <div className="field"><label>Company</label><VoiceInput value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Inc" /></div>
        </div>
        <div className="form-grid-2">
          <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@company.com" /></div>
          <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0123" /></div>
        </div>
        <div className="field"><label>Client Name *</label><VoiceInput value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="Client name" /></div>
        <div className="field">
          <label>Project Type</label>
          <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field"><label>Project Title *</label><VoiceInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Brand Refresh 2026" /></div>
        <div className="field"><label>Business Objective</label><VoiceInput value={form.objective} onChange={(v) => setForm({ ...form, objective: v })} placeholder="What are you trying to achieve?" rows={3} /></div>
        <div className="field"><label>Target Audience</label><VoiceInput value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} placeholder="e.g. Gen Z, professionals, SMEs" rows={3} /></div>
        <div className="field"><label>Creative Direction</label><VoiceInput value={form.direction} onChange={(v) => setForm({ ...form, direction: v })} placeholder="Any style, tone, or direction preferences?" rows={3} /></div>
        <div className="form-grid-2">
          <div className="field"><label>Budget Range</label><VoiceInput value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="e.g. $50,000 - $100,000" /></div>
          <div className="field"><label>Timeline</label><VoiceInput value={form.timeline} onChange={(v) => setForm({ ...form, timeline: v })} placeholder="e.g. 8-12 weeks" /></div>
        </div>
        <div className="field"><label>Additional Context</label><VoiceInput value={form.context} onChange={(v) => setForm({ ...form, context: v })} placeholder="Anything else the AI should know?" rows={3} /></div>
        <div className="row gap-2">
          <button className="btn btn-signal btn-sm" onClick={create} disabled={loading}>{loading ? "Creating…" : "Create project"}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
