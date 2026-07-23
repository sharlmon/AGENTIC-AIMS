"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, ExternalLink, Share2, Paperclip, Play, FileText } from "lucide-react"
import { PageHead } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"

type Project = {
  id: string
  name: string
  client: string
  type: string
  stage: string
  status: string
  progress: number
  createdAt: string
  publicToken?: string | null
}

const TYPES = [
  "Brand & Campaign",
  "Film & Motion",
  "Web & Product",
  "Strategy & Campaign",
]

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", client: "", email: "", company: "", type: "Brand & Campaign" })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [shareUrls, setShareUrls] = useState<Record<string, string>>({})
  const [sharing, setSharing] = useState<string | null>(null)
  const [delivOpen, setDelivOpen] = useState<string | null>(null)
  const [delivForms, setDelivForms] = useState<Record<string, { name: string; url: string }>>({})
  const [workflowRunning, setWorkflowRunning] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load projects")
      }
      const data = await res.json()
      setProjects(data)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.client) return
    setSaving(true)
    setActionError(null)
    try {
      const url = editId ? `/api/projects/${editId}` : "/api/projects"
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${editId ? "update" : "create"} project`)
      }
      setEditId(null)
      setForm({ name: "", client: "", email: "", company: "", type: "Brand & Campaign" })
      setEditing(false)
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p: Project) => {
    setForm({ name: p.name, client: p.client, email: "", company: "", type: p.type })
    setEditId(p.id)
    setEditing(true)
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return
    setActionError(null)
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to remove project")
      }
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const share = async (id: string) => {
    setSharing(id)
    setActionError(null)
    try {
      const res = await fetch(`/api/projects/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate share link")
      }
      const data = await res.json()
      setShareUrls((prev) => ({ ...prev, [id]: data.publicUrl }))
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSharing(null)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const toggleDeliv = (id: string) => {
    setDelivOpen((prev) => (prev === id ? null : id))
  }

  const addDeliverable = async (projectId: string) => {
    const form = delivForms[projectId]
    if (!form?.name?.trim() || !form?.url?.trim()) return
    setSaving(true)
    try {
      const project = await fetch(`/api/projects/${projectId}`).then((r) => r.json())
      const current = Array.isArray(project.deliverables) ? project.deliverables : []
      const updated = [...current, { name: form.name.trim(), url: form.url.trim() }]

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverables: updated }),
      })
      if (!res.ok) throw new Error("Failed to update deliverables")
      setDelivForms((prev) => ({ ...prev, [projectId]: { name: "", url: "" } }))
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const removeDeliverable = async (projectId: string, index: number) => {
    setSaving(true)
    try {
      const project = await fetch(`/api/projects/${projectId}`).then((r) => r.json())
      const current = Array.isArray(project.deliverables) ? project.deliverables : []
      const updated = current.filter((_: any, i: number) => i !== index)

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverables: updated }),
      })
      if (!res.ok) throw new Error("Failed to update deliverables")
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const runWorkflow = async (projectId: string) => {
    setWorkflowRunning(projectId)
    setActionError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/workflow/auto`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to run workflow")
      }
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setWorkflowRunning(null)
    }
  }

  const uploadDeliverable = async (projectId: string, file: File) => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `synthos/deliverables/${projectId}`)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Upload failed")
      }

      const data = await res.json()
      const project = await fetch(`/api/projects/${projectId}`).then((r) => r.json())
      const current = Array.isArray(project.deliverables) ? project.deliverables : []
      const name = file.name.replace(/\.[^/.]+$/, "")
      const updated = [...current, { name, url: data.url }]

      const patchRes = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverables: updated }),
      })
      if (!patchRes.ok) throw new Error("Failed to save deliverable")
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-content">
      <PageHead
        eyebrow="Admin"
        title="Projects"
        desc="Create and manage all projects across clients."
        actions={
          <button className="admin-btn-primary" onClick={() => { setEditing(!editing); setEditId(null); setForm({ name: "", client: "", email: "", company: "", type: "Brand & Campaign" }) }}>
            <Plus size={16} /> {editing && !editId ? "Cancel" : "New Project"}
          </button>
        }
      />

      {editing && (
        <div className="admin-section" style={{ marginBottom: 20, padding: 22 }}>
          <h3 className="admin-section-title" style={{ marginTop: 0 }}>{editId ? "Edit Project" : "Create New Project"}</h3>
          {actionError && <ErrorState title={actionError} style={{ marginBottom: 14 }} />}
          <div className="form-grid">
            <div className="form-grid-2">
              <div className="field">
                <label>Project Name</label>
                <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Atlas Rebrand" />
              </div>
              <div className="field">
                <label>Client Name</label>
                <input className="admin-input" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Client Email</label>
                <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@company.com" />
              </div>
              <div className="field">
                <label>Company</label>
                <input className="admin-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
              </div>
            </div>
            <div className="field" style={{ maxWidth: 320 }}>
              <label>Project Type</label>
              <select className="admin-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="row gap-2">
              <button className="admin-btn-primary" onClick={save} disabled={saving || !form.name || !form.client}>
                {saving ? "Saving…" : editId ? "Update Project" : "Create Project"}
              </button>
                <button className="admin-btn" onClick={() => { setEditing(false); setEditId(null); setForm({ name: "", client: "", email: "", company: "", type: "Brand & Campaign" }) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-section">
        <h3 className="admin-section-title">All Projects</h3>
        {loading ? (
          <p style={{ color: "#8e8e93", fontSize: "0.88rem" }}>Loading...</p>
        ) : projects.length === 0 ? (
          <div className="admin-table-empty">No projects yet</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Project">
                      <span style={{ fontWeight: 600, color: "#1b1a17" }}>{p.name}</span>
                    </td>
                    <td data-label="Client" className="admin-table-muted">{p.client}</td>
                    <td data-label="Type" className="admin-table-muted">{p.type}</td>
                    <td data-label="Stage" className="admin-table-muted">{p.stage}</td>
                    <td data-label="Status">
                      <span className={`admin-badge admin-badge-${p.status}`}>{p.status}</span>
                    </td>
                    <td data-label="Progress" className="admin-table-muted">{p.progress}%</td>
                    <td data-label="Actions">
                      <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <a href={`/dashboard/projects/${p.id}`} className="admin-icon-btn" title="Open workspace" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <ExternalLink size={14} />
                          </a>
                          <a href={`/dashboard/projects/${p.id}/templates`} className="admin-icon-btn" title="View templates" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={14} />
                          </a>
                          <button className="admin-icon-btn" title="Run AI workflow" onClick={() => runWorkflow(p.id)} disabled={workflowRunning === p.id}>
                            <Play size={14} />
                          </button>
                          <button className="admin-icon-btn" title="Share with client" onClick={() => share(p.id)} disabled={sharing === p.id}>
                            <Share2 size={14} />
                          </button>
                          <button className="admin-icon-btn" title="Deliverables" onClick={() => toggleDeliv(p.id)}>
                            <Paperclip size={14} />
                          </button>
                          <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(p)}><Edit size={14} /></button>
                          <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => remove(p.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {shareUrls[p.id] && (
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                            <input
                              readOnly
                              value={shareUrls[p.id]}
                              style={{ fontSize: "0.72rem", padding: "4px 8px", border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", width: 180, fontFamily: "var(--font-mono)" }}
                            />
                            <button className="admin-icon-btn" title="Copy link" onClick={() => copyToClipboard(shareUrls[p.id])} style={{ width: 28, height: 28 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                          </div>
                        )}
                        {delivOpen === p.id && (
                          <div style={{ width: "100%", marginTop: 10, padding: 14, border: "1px solid var(--line)", background: "var(--surface-2)" }}>
                            <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 8 }}>Deliverables</div>
                            {(p as any).deliverables?.length > 0 ? (
                              <ul style={{ paddingLeft: 18, fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                                {(p as any).deliverables.map((d: any, i: number) => (
                                  <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                    <a href={d.url} target="_blank" rel="noreferrer" style={{ color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{d.name}</a>
                                    <button className="admin-icon-btn admin-icon-btn-danger" title="Remove" onClick={() => removeDeliverable(p.id, i)} style={{ width: 24, height: 24 }}>
                                      <Trash2 size={12} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="tiny muted" style={{ marginBottom: 10 }}>No deliverables yet.</p>
                            )}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                              <input
                                className="admin-input"
                                placeholder="Name"
                                value={delivForms[p.id]?.name || ""}
                                onChange={(e) => setDelivForms((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || { name: "", url: "" }), name: e.target.value } }))}
                                style={{ flex: 1, minWidth: 120, padding: "8px 10px", fontSize: "0.82rem" }}
                              />
                              <input
                                className="admin-input"
                                placeholder="URL"
                                value={delivForms[p.id]?.url || ""}
                                onChange={(e) => setDelivForms((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || { name: "", url: "" }), url: e.target.value } }))}
                                style={{ flex: 1, minWidth: 160, padding: "8px 10px", fontSize: "0.82rem" }}
                              />
                              <button className="admin-btn-primary" onClick={() => addDeliverable(p.id)} disabled={saving} style={{ padding: "8px 12px", fontSize: "0.78rem" }}>
                                Add URL
                              </button>
                            </div>
                            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                              <label className="tiny muted" style={{ display: "block", marginBottom: 6 }}>Or upload a file</label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) uploadDeliverable(p.id, file)
                                }}
                                style={{ fontSize: "0.82rem", color: "var(--ink-2)" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
