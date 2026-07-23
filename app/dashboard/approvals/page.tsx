"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { AttrTag, StatusPill, Empty, ErrorState } from "@/components/app/ui"
import { ApprovalActionCard } from "@/components/app/ApprovalActionCard"

type ApprovalItem = {
  projectId: string
  project: string
  client: string
  kind: string
  status: string
  attr: "ai" | "human" | "mixed"
  note: string
  approvalId?: string
}

export default function ApprovalsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to load projects")
      const data = await res.json()
      setProjects(data)

      const approvalItems: ApprovalItem[] = []
      for (const p of data) {
        if (p.proposal && (p.proposal.status === "review" || p.proposal.status === "draft"))
          approvalItems.push({ projectId: p.id, project: p.name, client: p.client, kind: "Proposal", status: p.proposal.status, attr: "mixed", note: p.proposal.overview })
        if (p.quote && (p.quote.status === "review" || p.quote.status === "draft")) {
          const services = Array.isArray(p.quote.services) ? p.quote.services : []
          const sub = services.reduce((a: number, s: any) => a + s.qty * s.rate, 0)
          approvalItems.push({ projectId: p.id, project: p.name, client: p.client, kind: "Quote", status: p.quote.status, attr: "human", note: `$${sub.toLocaleString()} across ${services.length} services` })
        }
        if (p.approvals) {
          for (const a of p.approvals) {
            if (a.status === "review") {
              approvalItems.push({ projectId: p.id, project: p.name, client: p.client, kind: a.kind === "risk" ? "Flagged risk" : a.title, status: a.status, attr: a.kind === "risk" ? "ai" : "mixed", note: a.note || "", approvalId: a.id })
            }
          }
        }
      }
      setItems(approvalItems)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const awaiting = items.filter((i) => i.status === "review").length

  return (
    <PageWrap>
      <PageHead
        eyebrow="Human + AI"
        title="Approval Center"
        desc="Everything that needs human judgment. AI assists; humans decide."
        actions={<span className="tag-human"><span className="dot dot-human" /> {awaiting} awaiting your decision</span>}
      />
      <div className="hai-banner">
        <span className="tag-ai"><span className="dot dot-ai" /> AI assists</span>
        <span className="tag-human"><span className="dot dot-human" /> Humans decide</span>
        <p className="tiny muted">The system accelerates the work. Your review and sign-off is what sends anything to a client.</p>
      </div>

      {error ? (
        <ErrorState title="Could not load approvals" message={error} onRetry={load} />
      ) : loading ? (
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading…</p></div>
      ) : items.length === 0 ? (
        <Empty title="Nothing awaiting approval" hint="Items appear here when proposals, quotes, or flagged risks need a human decision." />
      ) : (
        <div className="feat-list" style={{ marginTop: 20 }}>
          {items.map((it) => (
            <ApprovalActionCard key={it.projectId + it.kind + (it.approvalId || "")} item={it} onUpdated={load} />
          ))}
        </div>
      )}
    </PageWrap>
  )
}
