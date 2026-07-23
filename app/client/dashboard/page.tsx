"use client"

import { useEffect, useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ExternalLink, Trash2 } from "lucide-react"
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
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [clientName, setClientName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push("/client/login")
      return
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) {
      router.push("/client/login")
      return
    }

    fetch(`/api/public/client/${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setProjects(data.projects || [])
        setClientName(data.clientName || user.fullName || null)
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", color: "var(--ink-2)", lineHeight: 1.6 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 8 }}>
              {clientName ? `Welcome, ${clientName}` : "Your Projects"}
            </h1>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>Track progress, review proposals, and send messages.</p>
          </div>
          <button onClick={() => signOut()} className="btn btn-ghost btn-sm">Log Out</button>
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", border: "1px solid var(--line)" }}>
            <p style={{ color: "var(--ink-3)", fontSize: "0.92rem" }}>No projects yet. Projects will appear here once an admin links them to your account.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map((p) => (
              <div key={p.id} style={{ border: "1px solid var(--line)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Link href={p.publicToken ? `/public/project/${p.publicToken}` : "#"} style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600, fontSize: "1rem", fontFamily: "var(--font-serif)" }}>
                    {p.name}
                  </Link>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span className={`admin-badge admin-badge-${p.status}`}>{p.status}</span>
                    <span className="chip">{p.type}</span>
                    <span className="tiny muted">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {p.publicToken && (
                    <Link href={`/public/project/${p.publicToken}`} className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
                      Open
                    </Link>
                  )}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
