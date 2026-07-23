"use client"

import { useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
import { VoiceInput } from "@/components/app/VoiceInput"

type Career = {
  id: string
  title: string
  slug: string
  description: string
  requirements: string[]
  type: string
  location?: string
  salaryMin?: string
  salaryMax?: string
  status: string
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt?: string
}

export function CareersManager({ initialCareers }: { initialCareers: Career[] }) {
  const [careers, setCareers] = useState<Career[]>(initialCareers)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "", slug: "", description: "", requirements: "", type: "full-time", location: "", salaryMin: "", salaryMax: "", status: "open", publishedAt: "", expiresAt: ""
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch("/api/careers")
    const data = await res.json()
    setCareers(data)
    setLoading(false)
  }

  const startEdit = (career: Career) => {
    setForm({
      title: career.title,
      slug: career.slug,
      description: career.description,
      requirements: career.requirements.join("\n"),
      type: career.type,
      location: career.location || "",
      salaryMin: career.salaryMin || "",
      salaryMax: career.salaryMax || "",
      status: career.status,
      publishedAt: career.publishedAt || "",
      expiresAt: career.expiresAt || "",
    })
    setEditId(career.id)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditId(null)
    setForm({ title: "", slug: "", description: "", requirements: "", type: "full-time", location: "", salaryMin: "", salaryMax: "", status: "open", publishedAt: "", expiresAt: "" })
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
    }
    try {
      if (editId) {
        await fetch(`/api/careers/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/careers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      cancelEdit()
      load()
    } catch (e) {
      console.error("Failed to save career:", e)
      alert("Failed to save career")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this career posting?")) return
    await fetch(`/api/careers/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 className="admin-section-title" style={{ margin: 0 }}>Careers</h3>
        <button className="admin-btn" onClick={() => editing ? cancelEdit() : setEditing(true)}>
          <Plus size={16} /> {editing ? "Cancel" : "New Position"}
        </button>
      </div>

      {editing && (
        <div className="admin-section" style={{ marginBottom: 20, padding: 22 }}>
            <div style={{ display: "grid", gap: 14 }}>
            <div className="field">
              <label>Job Title</label>
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Creative Writer" />
            </div>
            <div className="field">
              <label>Slug (optional)</label>
              <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-from-title" />
            </div>
            <div className="field">
              <label>Description</label>
              <VoiceInput value={form.description} onChange={(val) => setForm({ ...form, description: val })} placeholder="Job description..." rows={4} />
            </div>
            <div className="field">
              <label>Requirements (one per line)</label>
              <VoiceInput value={form.requirements} onChange={(val) => setForm({ ...form, requirements: val })} placeholder="5+ years experience\nPortfolio required\n..." rows={4} />
            </div>
            <div className="form-grid-3">
              <div className="field">
                <label>Type</label>
                <select className="admin-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="field">
                <label>Location</label>
                <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Nairobi, Remote" />
              </div>
              <div className="field">
                <label>Status</label>
                <select className="admin-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </select>
              </div>
            </div>
            <div className="form-grid-3">
              <div className="field">
                <label>Salary Min</label>
                <input className="admin-input" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="e.g. 50000" />
              </div>
              <div className="field">
                <label>Salary Max</label>
                <input className="admin-input" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="e.g. 80000" />
              </div>
              <div className="field">
                <label>Expires At</label>
                <input className="admin-input" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
            <button className="admin-btn-primary" onClick={save} disabled={saving || !form.title || !form.description}>
              {saving ? "Saving..." : editId ? "Update Position" : "Publish Position"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#8e8e93", fontSize: "0.88rem" }}>Loading...</p>
      ) : careers.length === 0 ? (
        <div className="admin-section" style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "#8e8e93", fontSize: "0.88rem" }}>No career postings yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table responsive-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Posted</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((career) => (
                <tr key={career.id}>
                  <td data-label="Title">
                    <div style={{ fontWeight: 600, color: "#1b1a17" }}>{career.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "#8e8e93", marginTop: 2 }}>{career.description.slice(0, 80)}...</div>
                  </td>
                  <td data-label="Type" className="admin-table-muted">{career.type}</td>
                  <td data-label="Location" className="admin-table-muted">{career.location || "—"}</td>
                  <td data-label="Status">
                    <span className={`admin-badge admin-badge-${career.status === "open" ? "active" : career.status === "filled" ? "complete" : "draft"}`}>
                      {career.status}
                    </span>
                  </td>
                  <td data-label="Posted" className="admin-table-muted">{career.publishedAt ? new Date(career.publishedAt).toLocaleDateString() : new Date(career.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(career)}><Edit size={14} /></button>
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => remove(career.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
