"use client"

import { useState, useEffect } from "react"
import { FileText, ChevronRight } from "lucide-react"
import Link from "next/link"
import { PageHead } from "@/components/app/Page"
import { Empty, StatusPill, ErrorState } from "@/components/app/ui"

type ContactReport = {
  id: string
  projectId: string
  project: { id: string; name: string; client: string }
  summary: string
  keyPoints: string[]
  decisions: string[]
  actionItems: any[]
  nextSteps: string[]
  sentToClient: boolean
  sentAt?: string
  createdAt: string
}

export default function ContactReportsPage() {
  const [reports, setReports] = useState<ContactReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ContactReport | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/contact-reports")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load contact reports")
      }
      const data = await res.json()
      setReports(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (selected) {
    return (
      <div className="admin-content">
        <PageHead
          eyebrow="Contact Report"
          title={selected.project?.name || "Contact Report"}
          desc={`For ${selected.project?.client || "client"}`}
          actions={
            <div style={{ display: "flex", gap: 8 }}>
              <button className="admin-btn" onClick={() => setSelected(null)}>Back to list</button>
              <Link href={`/dashboard/projects/${selected.projectId}`} className="admin-btn-primary">Open Project</Link>
            </div>
          }
        />

        <div style={{ display: "grid", gap: 16 }}>
          <div className="admin-section">
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={18} />
                  <h3 style={{ fontSize: "1rem" }}>Summary</h3>
                </div>
                <div className="row gap-2">
                  <span className="eyebrow">Generated {new Date(selected.createdAt).toLocaleDateString()}</span>
                  {selected.sentToClient && <StatusPill status="approved" />}
                </div>
              </div>
              <p style={{ color: "var(--ink-2)", lineHeight: 1.65 }}>{selected.summary}</p>
            </div>
          </div>

          {selected.keyPoints.length > 0 && (
            <div className="admin-section">
              <div style={{ padding: 22 }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>Key Points</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.keyPoints.map((kp, i) => (
                    <li key={i} style={{ color: "var(--ink-2)" }}>{kp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selected.decisions.length > 0 && (
            <div className="admin-section">
              <div style={{ padding: 22 }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>Decisions Made</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.decisions.map((d, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{d}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selected.actionItems?.length > 0 && (
            <div className="admin-section">
              <div style={{ padding: 22 }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>Action Items</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.actionItems.map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                      <div>
                        <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.88rem" }}>{item.who || "Unassigned"}</span>
                        <span style={{ color: "var(--ink-2)", fontSize: "0.85rem", marginLeft: 8 }}>{item.task}</span>
                      </div>
                      {item.due && <span className="mono tiny" style={{ color: "var(--ink-3)" }}>{item.due}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selected.nextSteps.length > 0 && (
            <div className="admin-section">
              <div style={{ padding: 22 }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>Next Steps</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.nextSteps.map((ns, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-2)" }}>
                      <ChevronRight size={14} style={{ color: "var(--signal)", flexShrink: 0 }} />
                      {ns}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-content">
      <PageHead
        eyebrow="Reports"
        title="Contact Reports"
        desc="Meeting summaries and action items generated after client calls."
      />

      <div className="admin-section">
        {error ? (
          <ErrorState title="Could not load contact reports" message={error} onRetry={load} />
        ) : loading ? (
          <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading reports…</p></div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty title="No contact reports yet" hint="Reports are generated automatically when meetings end." />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table responsive-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Summary</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                    <td data-label="Project" style={{ fontWeight: 600, color: "var(--ink)" }}>{r.project?.name || "—"}</td>
                    <td data-label="Client">{r.project?.client || "—"}</td>
                    <td data-label="Summary">
                      <span style={{ fontSize: "0.85rem", color: "var(--ink-2)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.summary}</span>
                    </td>
                    <td data-label="Date" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--ink-3)" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Status">
                      <StatusPill status={r.sentToClient ? "approved" : "review"} />
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
