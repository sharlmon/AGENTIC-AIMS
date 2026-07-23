"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/types"
import { Panel, PanelHeader, AttrTag, StatusPill, ErrorState } from "@/components/app/ui"
import { useRouter } from "next/navigation"

export function ApprovalStage({ project }: { project: Project }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState([
    { title: "Proposal", kind: "proposal" as const, status: project.proposal?.status || "draft", attr: "mixed" as const, note: project.proposal?.overview || "No proposal yet" },
    { title: "Quote", kind: "quote" as const, status: project.quote?.status || "draft", attr: "human" as const, note: project.quote?.services?.length ? `Total for ${project.quote.services.length} services` : "No quote yet" },
  ])
  const router = useRouter()

  useEffect(() => {
    if (items.every(it => it.status === "approved")) {
      setTimeout(() => {
        fetch(`/api/projects/${project.id}/workflow/advance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auto" }) })
          .then(() => router.refresh())
          .catch((e) => console.error("Failed to advance workflow:", e))
      }, 1000)
    }
  }, [items])

  const updateStatus = async (kind: "proposal" | "quote", status: "draft" | "review" | "approved" | "rejected") => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [kind]: { status } }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to update ${kind}`)
      }
      setItems(prev => prev.map(it => it.kind === kind ? { ...it, status } : it))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack gap-5">
      <Panel>
        <PanelHeader
          eyebrow="Stage 10"
          title="Human Approval"
          desc="The final gate. AI assists; humans decide. Review every output and give final direction."
          actions={<span className="tag-human"><span className="dot dot-human" /> Humans decide</span>}
        />
        <div className="stack gap-3" style={{ padding: 24 }}>
          {error && <ErrorState title={error} />}
          {items.map((it, i) => (
            <div key={i} className="approve-item">
              <div className="stack gap-1 grow">
                <div className="row gap-2">
                  <h4 style={{ fontSize: "0.98rem" }}>{it.title}</h4>
                  <AttrTag attr={it.attr} />
                  <StatusPill status={it.status} />
                </div>
                <p className="tiny muted">{it.note}</p>
              </div>
              <div className="row gap-2 shrink-0 wrap">
                <button className="btn btn-signal btn-sm" onClick={() => updateStatus(it.kind, "approved")} disabled={loading}>{loading ? "Saving…" : "Approve"}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(it.kind, "rejected")} disabled={loading}>Reject</button>
                <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(it.kind, "review")} disabled={loading}>Request revision</button>
              </div>
            </div>
          ))}
          <div className="approve-banner">
            <span className="tag-ai"><span className="dot dot-ai" /> AI assists</span>
            <span className="tag-human"><span className="dot dot-human" /> Humans decide</span>
            <p className="tiny muted">The system accelerated the work. Your sign-off is what sends it to the client.</p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
