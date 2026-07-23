"use client"

import { useState } from "react"
import Link from "next/link"
import { AttrTag, StatusPill, ErrorState } from "@/components/app/ui"

export function ApprovalActionCard({ item, onUpdated }: { item: { projectId: string; kind: string; status: string; attr: "ai" | "human" | "mixed"; note: string; approvalId?: string; client: string; project: string }; onUpdated?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function decide(status: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${item.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          item.approvalId
            ? { approvalId: item.approvalId, approvalStatus: status }
            : { proposal: { status } }
        ),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${status}`)
      }
      onUpdated?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return (
      <div className="feat-row" style={{ gridTemplateColumns: "1fr" }}>
        <ErrorState title="Action failed" message={error} onRetry={() => decide("review")} />
      </div>
    )
  }

  return (
    <div className="feat-row" style={{ gridTemplateColumns: "1.3fr 1fr auto auto auto" }}>
      <Link href={`/dashboard/projects/${item.projectId}`} className="grow" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="stack gap-1">
          <span className="tiny muted">{item.client} · {item.kind}</span>
          <span style={{ fontWeight: 600, color: "var(--ink)" }}>{item.project}</span>
          <span className="tiny muted">{item.note}</span>
        </div>
      </Link>
      <AttrTag attr={item.attr} />
      <StatusPill status={item.status} />
      <div className="row gap-2">
        <button className="btn btn-subtle btn-sm" disabled={busy} onClick={() => decide("approved")}>{busy ? "…" : "Approve"}</button>
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => decide("rejected")}>Reject</button>
      </div>
    </div>
  )
}
