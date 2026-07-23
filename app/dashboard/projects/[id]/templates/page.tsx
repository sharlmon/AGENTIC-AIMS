"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { FileText } from "lucide-react"
import "@/components/app/admin.css"

type Project = {
  id: string
  name: string
  type: string
  stage: string
  status: string
}

export default function TemplatesPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => {
        setProject({
          id: data.id,
          name: data.name,
          type: data.type,
          stage: data.stage,
          status: data.status,
        })
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [projectId])

  const templates = [
    { name: "Full Presentation", type: "presentation", desc: "Combined brief, meeting summary, proposal, and quote in one deck" },
    { name: "Project Brief", type: "project-brief", desc: "Strategic foundation with objectives, audience, and deliverables" },
    { name: "Contact Report", type: "contact-report", desc: "Meeting summary with key points, decisions, and action items" },
    { name: "Proposal", type: "proposal", desc: "Full client proposal with overview, scope, timeline, and investment" },
    { name: "Quote", type: "quote", desc: "Itemized quote with services, rates, and payment terms" },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Loading…
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--rejected)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Project not found
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", color: "var(--ink-2)", lineHeight: 1.6 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--signal)", marginBottom: 12 }}>
          {project.type}
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
          Templates
        </h1>
        <p style={{ fontSize: "0.92rem", color: "var(--ink-3)", marginBottom: 8 }}>
          Project: <span style={{ color: "var(--ink-2)" }}>{project.name}</span>
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
          <span className={`admin-badge admin-badge-${project.status}`}>{project.status}</span>
          <span className="chip">{project.stage}</span>
          <Link href={`/dashboard/projects/${project.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
            Back to Project
          </Link>
        </div>
        <a
          href={`/api/templates/presentation/${project.id}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-signal"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FileText size={16} />
          Open Full Presentation
        </a>
      </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {templates.map((t) => (
            <div key={t.type} style={{ border: "1px solid var(--line)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--ink)", fontWeight: 500, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-3)" }}>{t.desc}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={`/api/templates/${t.type}/${project.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ textDecoration: "none" }}
                >
                  View
                </a>
                <button
                  className="btn btn-signal btn-sm"
                  onClick={() => {
                    const win = window.open(`/api/templates/${t.type}/${project.id}`, "_blank")
                    if (win) {
                      win.onload = () => {
                        win.print()
                      }
                    }
                  }}
                >
                  Print / PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
