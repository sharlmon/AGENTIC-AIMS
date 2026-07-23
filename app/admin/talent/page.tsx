"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Search, UserPlus } from "lucide-react"
import { PageHead } from "@/components/app/Page"
import { StatusPill, Empty, ErrorState } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

type Talent = {
  id: string
  name: string
  email: string
  role: string
  skills: string[]
  experience: number
  rating: number
  availability: string
  rate: string
  portfolio?: string
  notes?: string
}

const ROLES = [
  { value: "creative", label: "Creative" },
  { value: "strategist", label: "Strategist" },
  { value: "producer", label: "Producer" },
  { value: "designer", label: "Designer" },
  { value: "developer", label: "Developer" },
  { value: "animator", label: "Animator" },
]

const AVAILABILITY = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "unavailable", label: "Unavailable" },
]

export default function TalentPage() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterAvail, setFilterAvail] = useState("all")
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: "", email: "", role: "creative", skills: "", experience: "0", rating: "0", availability: "available", rate: "", portfolio: "", notes: ""
  })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/talent")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load talent")
      }
      const data = await res.json()
      setTalents(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    setActionError(null)
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        experience: parseInt(form.experience) || 0,
        rating: parseFloat(form.rating) || 0,
      }
      const url = editId ? `/api/talent/${editId}` : "/api/talent"
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${editId ? "update" : "add"} talent`)
      }
      setEditId(null)
      setForm({ name: "", email: "", role: "creative", skills: "", experience: "0", rating: "0", availability: "available", rate: "", portfolio: "", notes: "" })
      setEditing(false)
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Remove this talent from the database?")) return
    setActionError(null)
    try {
      const res = await fetch(`/api/talent/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to remove talent")
      }
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const startEdit = (t: Talent) => {
    setForm({
      name: t.name, email: t.email, role: t.role, skills: t.skills.join(", "),
      experience: String(t.experience), rating: String(t.rating), availability: t.availability,
      rate: t.rate, portfolio: t.portfolio || "", notes: t.notes || ""
    })
    setEditId(t.id)
    setEditing(true)
  }

  const filtered = talents.filter((t) => {
    const matchSearch = !search || `${t.name} ${t.email} ${t.role} ${t.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === "all" || t.role === filterRole
    const matchAvail = filterAvail === "all" || t.availability === filterAvail
    return matchSearch && matchRole && matchAvail
  })

  return (
    <div className="admin-content">
      <PageHead
        eyebrow="Talent"
        title="Talent Intelligence"
        desc="Identify, recruit, and manage creative talent. Match skills, experience, and availability to projects."
        actions={
          <button className="admin-btn-primary" onClick={() => { setEditing(!editing); setEditId(null); setForm({ name: "", email: "", role: "creative", skills: "", experience: "0", rating: "0", availability: "available", rate: "", portfolio: "", notes: "" }) }}>
            <UserPlus size={16} /> Add Talent
          </button>
        }
      />

      {editing && (
        <div className="admin-section" style={{ marginBottom: 20 }}>
          <div style={{ padding: 22 }}>
            <h3 className="admin-section-title" style={{ marginTop: 0 }}>{editId ? "Edit Talent" : "Add New Talent"}</h3>
            {actionError && <ErrorState title={actionError} style={{ marginBottom: 14 }} />}
            <div className="form-grid">
              <div className="form-grid-2">
                <div className="field">
                  <label>Full Name</label>
                  <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. joshua mwendwa" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="joshua@studio.com" />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="field">
                  <label>Role</label>
                  <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Availability</label>
                  <select className="admin-input" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                    {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Rate</label>
                  <input className="admin-input" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="$500/day" />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="field">
                  <label>Experience (years)</label>
                  <input className="admin-input" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div className="field">
                  <label>Rating (0-5)</label>
                  <input className="admin-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                </div>
                <div className="field">
                  <label>Portfolio URL</label>
                  <input className="admin-input" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="field">
                <label>Skills (comma-separated)</label>
                <input className="admin-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="copywriting, strategy, design, film" />
              </div>
              <div className="field">
                <label>Notes</label>
                <VoiceInput value={form.notes} onChange={(val) => setForm({ ...form, notes: val })} rows={2} />
              </div>
              <div className="row gap-2">
                <button className="admin-btn-primary" onClick={save} disabled={saving || !form.name || !form.email}>{saving ? "Saving…" : editId ? "Update" : "Add Talent"}</button>
                <button className="admin-btn" onClick={() => { setEditing(false); setEditId(null) }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-section">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
            <input className="admin-input" placeholder="Search talents…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: "100%" }} />
          </div>
          <select className="admin-input" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All roles</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select className="admin-input" value={filterAvail} onChange={(e) => setFilterAvail(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All availability</option>
            {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

      {error ? (
        <ErrorState title="Could not load talent" message={error} onRetry={load} />
      ) : loading ? (
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading talent…</p></div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Empty title="No talent found" hint={talents.length === 0 ? "Add your first creative talent to get started." : "Try adjusting your search or filters."} />
        </div>
      ) : (
          <div className="admin-table-wrap">
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Rate</th>
                  <th>Availability</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Name">
                      <div style={{ fontWeight: 600, color: "#1b1a17" }}>{t.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#8e8e93" }}>{t.email}</div>
                    </td>
                    <td data-label="Role" style={{ textTransform: "capitalize" }}>{t.role}</td>
                    <td data-label="Skills">
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {t.skills.slice(0, 3).map((s) => (
                          <span key={s} style={{ fontSize: "0.7rem", padding: "2px 8px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{s}</span>
                        ))}
                        {t.skills.length > 3 && <span style={{ fontSize: "0.7rem", padding: "2px 8px", color: "var(--ink-3)" }}>+{t.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td data-label="Experience">{t.experience}y</td>
                    <td data-label="Rating">
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{t.rating.toFixed(1)}</span>
                    </td>
                    <td data-label="Rate" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{t.rate}</td>
                    <td data-label="Availability">
                      <StatusPill status={t.availability === "available" ? "active" : t.availability === "busy" ? "review" : "draft"} />
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(t)}><Edit size={14} /></button>
                        <button className="admin-icon-btn admin-icon-btn-danger" title="Remove" onClick={() => remove(t.id)}><Trash2 size={14} /></button>
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
