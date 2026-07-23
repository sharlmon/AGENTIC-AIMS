"use client"

import { useState, useRef } from "react"
import { Plus, Trash2, Edit, Upload } from "lucide-react"
import Image from "next/image"
import { VoiceInput } from "@/components/app/VoiceInput"

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  skills: string[]
  availability: string
  avatar?: string
  description?: string
  calendarJson?: any
  notes?: string
  createdAt: string
  updatedAt: string
}

const ROLES = [
  { value: "creative_writer", label: "Creative Writer" },
  { value: "producer", label: "Producer" },
  { value: "account_manager", label: "Account Manager" },
  { value: "admin", label: "Admin" },
]

export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", role: "creative_writer", skills: "", availability: "available", avatar: "", description: "", notes: ""
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const res = await fetch("/api/team")
    const data = await res.json()
    setMembers(data)
  }

  const uploadAvatar = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "synthos/team")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      if (data.url) setForm(f => ({ ...f, avatar: data.url }))
    } catch (e) {
      console.error("Upload failed", e)
      alert(e instanceof Error ? e.message : "Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const startEdit = (m: TeamMember) => {
    setForm({
      name: m.name, email: m.email, role: m.role, skills: m.skills.join(", "),
      availability: m.availability, avatar: m.avatar || "", description: m.description || "", notes: m.notes || ""
    })
    setEditId(m.id)
    setEditing(true)
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    }
    const url = editId ? `/api/team/${editId}` : "/api/team"
    const method = editId ? "PATCH" : "POST"
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setEditing(false)
    setEditId(null)
    setForm({ name: "", email: "", role: "creative_writer", skills: "", availability: "available", avatar: "", description: "", notes: "" })
    load()
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm("Remove this team member?")) return
    await fetch(`/api/team/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 className="admin-section-title" style={{ margin: 0 }}>Team Members</h3>
        <button className="admin-btn" onClick={() => setEditing(!editing)}>
          <Plus size={16} /> {editing ? "Cancel" : "Add Member"}
        </button>
      </div>

      {editing && (
        <div className="admin-section" style={{ marginBottom: 20, padding: 22 }}>
          <div className="form-grid">
            <div style={{ gridColumn: "1 / -1", marginBottom: 8 }}>
              <h3 className="admin-section-title" style={{ margin: 0 }}>{editId ? "Edit Team Member" : "Add New Team Member"}</h3>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Full Name</label>
                <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. joshua mwendwa" />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="joshua@synthos.studio" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Role</label>
                <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Availability</label>
                <select className="admin-input" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Avatar</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {form.avatar && (
                  <img src={form.avatar} alt="Avatar preview" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--line)" }} />
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                  <button type="button" className="admin-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload size={16} /> {uploading ? "Uploading…" : form.avatar ? "Change photo" : "Upload photo"}
                  </button>
                </div>
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <VoiceInput value={form.description} onChange={(val) => setForm({ ...form, description: val })} placeholder="Short bio or description for this team member..." rows={3} />
            </div>
            <div className="field">
              <label>Skills (comma-separated)</label>
              <input className="admin-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="copywriting, strategy, design" />
            </div>
            <div className="field">
              <label>Notes</label>
              <VoiceInput value={form.notes} onChange={(val) => setForm({ ...form, notes: val })} placeholder="Any scheduling notes..." rows={3} buttonClassName="admin-btn" />
            </div>
              <button className="admin-btn-primary" onClick={save} disabled={saving || !form.name || !form.email}>
                {saving ? "Saving..." : editId ? "Update" : "Add Team Member"}
              </button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="admin-section" style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "#8e8e93", fontSize: "0.88rem" }}>No team members yet. Add your first team member above.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table responsive-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Availability</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td data-label="Avatar">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--line)" }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-2)", border: "2px solid var(--line)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-3)" }}>
                        {m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td data-label="Name">
                    <span style={{ fontWeight: 600, color: "#1b1a17" }}>{m.name}</span>
                  </td>
                  <td data-label="Email" className="admin-table-muted">{m.email}</td>
                  <td data-label="Role">
                    <span className="admin-badge admin-badge-active">{m.role.replace("_", " ")}</span>
                  </td>
                  <td data-label="Availability">
                    <span className={`admin-badge admin-badge-${m.availability === "available" ? "active" : m.availability === "busy" ? "review" : "draft"}`}>
                      {m.availability}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(m)}><Edit size={14} /></button>
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Remove" onClick={() => remove(m.id)}><Trash2 size={14} /></button>
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
