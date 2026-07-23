"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import "@/components/app/admin.css"

type Project = {
  id: string
  name: string
  type: string
  stage: string
  status: string
  progress: number
  publicToken: string | null
  proposal: any
  quote: any
  updatedAt: string
}

export default function ClientDashboardPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [clientName, setClientName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const res = await fetch(`/api/public/client/${encodeURIComponent(email.trim())}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load projects")
      }
      const data = await res.json()
      setProjects(data.projects || [])
      setClientName(data.clientName || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", color: "var(--ink-2)", lineHeight: 1.6 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Client Dashboard
          </h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>
            Enter your email to view your projects and messages.
          </p>
        </div>

        <div style={{ marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input
                className="admin-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-signal" disabled={loading}>
              {loading ? "Loading…" : "View Projects"}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ padding: "16px 20px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 24 }}>
            {error}
          </div>
        )}

        {clientName && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>
              Welcome, <span style={{ color: "var(--ink)", fontWeight: 600 }}>{clientName}</span>. Here are your projects:
            </p>
          </div>
        )}

        {searched && projects.length === 0 && !error && (
          <div style={{ padding: 40, textAlign: "center", border: "1px solid var(--line)" }}>
            <p style={{ color: "var(--ink-3)", fontSize: "0.92rem" }}>No projects found for this email.</p>
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map((p) => (
              <div key={p.id} style={{ border: "1px solid var(--line)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <Link href={p.publicToken ? `/public/project/${p.publicToken}` : "#"} style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600, fontSize: "1rem", fontFamily: "var(--font-serif)" }}>
                    {p.name}
                  </Link>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span className={`admin-badge admin-badge-${p.status}`}>{p.status}</span>
                    <span className="chip">{p.type}</span>
                    <span className="tiny muted">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {p.publicToken && (
                    <Link href={`/public/project/${p.publicToken}`} className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
                      Open
                    </Link>
                  )}
                  {(p.proposal || p.quote) && (
                    <>
                      {p.proposal?.sentToClient && (
                        <Link href={`/public/approve/${p.proposal.publicToken}`} className="btn btn-signal btn-sm" style={{ textDecoration: "none" }}>
                          Proposal
                        </Link>
                      )}
                      {p.quote?.sentToClient && (
                        <Link href={`/public/approve/${p.quote.publicToken}`} className="btn btn-signal btn-sm" style={{ textDecoration: "none" }}>
                          Quote
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
