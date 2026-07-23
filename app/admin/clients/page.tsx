"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Search, Users2, FileText } from "lucide-react"
import { PageHead } from "@/components/app/Page"
import { StatusPill, Empty, ErrorState } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"

type Client = {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  industry?: string
  status: string
  source?: string
  value?: string
  lastContact?: string
  nextAction?: string
  tags: string[]
  notes?: string
  dossier?: any
}

const STATUSES = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editing, setEditing] = useState(false)
  const [viewing, setViewing] = useState<Client | null>(null)
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", industry: "", status: "lead",
    source: "", value: "", lastContact: "", nextAction: "", tags: "", notes: "", dossier: ""
  })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/clients")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load clients")
      }
      const data = await res.json()
      setClients(data)
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
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        dossier: form.dossier ? { notes: form.dossier } : null,
      }
      const url = editId ? `/api/clients/${editId}` : "/api/clients"
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${editId ? "update" : "add"} client`)
      }
      setEditId(null)
      setForm({ name: "", company: "", email: "", phone: "", industry: "", status: "lead", source: "", value: "", lastContact: "", nextAction: "", tags: "", notes: "", dossier: "" })
      setEditing(false)
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Remove this client?")) return
    setActionError(null)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to remove client")
      }
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  const startEdit = (c: Client) => {
    setForm({
      name: c.name, company: c.company, email: c.email, phone: c.phone || "", industry: c.industry || "",
      status: c.status, source: c.source || "", value: c.value || "", lastContact: c.lastContact || "",
      nextAction: c.nextAction || "", tags: c.tags.join(", "), notes: c.notes || "", dossier: c.dossier?.notes || ""
    })
    setEditId(c.id)
    setEditing(true)
  }

  const filtered = clients.filter((c) => {
    const matchSearch = !search || `${c.name} ${c.company} ${c.email} ${c.industry}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || c.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="admin-content">
      <PageHead
        eyebrow="Relationships"
        title="Client CRM"
        desc="Manage client relationships, track interactions, and maintain dossiers for every account."
        actions={
          <button className="admin-btn-primary" onClick={() => { setEditing(!editing); setEditId(null); setForm({ name: "", company: "", email: "", phone: "", industry: "", status: "lead", source: "", value: "", lastContact: "", nextAction: "", tags: "", notes: "", dossier: "" }) }}>
            <Plus size={16} /> Add Client
          </button>
        }
      />

      {editing && (
        <div className="admin-section" style={{ marginBottom: 20 }}>
          <div style={{ padding: 22 }}>
            <h3 className="admin-section-title" style={{ marginTop: 0 }}>{editId ? "Edit Client" : "Add New Client"}</h3>
            {actionError && <ErrorState title={actionError} style={{ marginBottom: 14 }} />}
            <div className="form-grid">
              <div className="form-grid-2">
                <div className="field">
                  <label>Contact Name</label>
                  <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. joshua mwendwa" />
                </div>
                <div className="field">
                  <label>Company</label>
                  <input className="admin-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="field">
                  <label>Email</label>
                  <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="joshua@acme.com" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0123" />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="field">
                  <label>Industry</label>
                  <input className="admin-input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Technology" />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="admin-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Source</label>
                  <input className="admin-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Referral, Website, etc." />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="field">
                  <label>Project Value</label>
                  <input className="admin-input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="$50,000" />
                </div>
                <div className="field">
                  <label>Last Contact</label>
                  <input className="admin-input" type="date" value={form.lastContact} onChange={(e) => setForm({ ...form, lastContact: e.target.value })} />
                </div>
                <div className="field">
                  <label>Next Action</label>
                  <input className="admin-input" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="Schedule follow-up" />
                </div>
              </div>
              <div className="field">
                <label>Tags (comma-separated)</label>
                <input className="admin-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="branding, video, web" />
              </div>
              <div className="field">
                <label>Notes</label>
                <VoiceInput value={form.notes} onChange={(val) => setForm({ ...form, notes: val })} rows={2} />
              </div>
              <div className="field">
                <label>Dossier</label>
                <VoiceInput value={form.dossier} onChange={(val) => setForm({ ...form, dossier: val })} rows={3} placeholder="Key client insights, preferences, history…" />
              </div>
              <div className="row gap-2">
                <button className="admin-btn-primary" onClick={save} disabled={saving || !form.name || !form.email}>{saving ? "Saving…" : editId ? "Update" : "Add Client"}</button>
                <button className="admin-btn" onClick={() => { setEditing(false); setEditId(null) }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="admin-section" style={{ marginBottom: 20, border: "2px solid var(--signal)" }}>
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: "1.1rem" }}>{viewing.company || viewing.name}</h3>
                <p className="muted tiny">{viewing.name} · {viewing.industry} · <StatusPill status={viewing.status === "lead" ? "review" : viewing.status === "active" ? "active" : viewing.status === "completed" ? "approved" : "draft"} /></p>
              </div>
              <button className="admin-btn" onClick={() => setViewing(null)}>Close</button>
            </div>
            <div className="form-grid-2" style={{ marginBottom: 14 }}>
              <div><span className="eyebrow">Email</span><p style={{ color: "var(--ink-2)" }}>{viewing.email}</p></div>
              <div><span className="eyebrow">Phone</span><p style={{ color: "var(--ink-2)" }}>{viewing.phone || "—"}</p></div>
              <div><span className="eyebrow">Source</span><p style={{ color: "var(--ink-2)" }}>{viewing.source || "—"}</p></div>
              <div><span className="eyebrow">Value</span><p style={{ color: "var(--ink-2)" }}>{viewing.value || "—"}</p></div>
              <div><span className="eyebrow">Last Contact</span><p style={{ color: "var(--ink-2)" }}>{viewing.lastContact || "—"}</p></div>
              <div><span className="eyebrow">Next Action</span><p style={{ color: "var(--ink-2)" }}>{viewing.nextAction || "—"}</p></div>
            </div>
            {viewing.tags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span className="eyebrow">Tags</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                  {viewing.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: "0.7rem", padding: "2px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {viewing.notes && (
              <div style={{ marginBottom: 12 }}>
                <span className="eyebrow">Notes</span>
                <p style={{ color: "var(--ink-2)", marginTop: 4 }}>{viewing.notes}</p>
              </div>
            )}
            {viewing.dossier?.notes && (
              <div style={{ padding: 16, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <FileText size={14} />
                  <span className="eyebrow">Client Dossier</span>
                </div>
                <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>{viewing.dossier.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="admin-section">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
            <input className="admin-input" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: "100%" }} />
          </div>
          <select className="admin-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

      {error ? (
        <ErrorState title="Could not load clients" message={error} onRetry={load} />
      ) : loading ? (
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading clients…</p></div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Empty title="No clients found" hint={clients.length === 0 ? "Add your first client to start building relationships." : "Try adjusting your search or filters."} />
        </div>
      ) : (
          <div className="admin-table-wrap">
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Industry</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Next Action</th>
                  <th style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Client">
                      <div style={{ fontWeight: 600, color: "#1b1a17" }}>{c.company || c.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#8e8e93" }}>{c.email}</div>
                    </td>
                    <td data-label="Industry">{c.industry || "—"}</td>
                    <td data-label="Value" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{c.value || "—"}</td>
                    <td data-label="Status">
                      <StatusPill status={c.status === "lead" ? "review" : c.status === "active" ? "active" : c.status === "completed" ? "approved" : "draft"} />
                    </td>
                    <td data-label="Next Action">
                      <span style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}>{c.nextAction || "—"}</span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-icon-btn" title="View dossier" onClick={() => setViewing(c)}><Users2 size={14} /></button>
                        <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(c)}><Edit size={14} /></button>
                        <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => remove(c.id)}><Trash2 size={14} /></button>
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
