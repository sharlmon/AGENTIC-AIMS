"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/types"
import { Panel, PanelHeader, StatusPill, Empty } from "@/components/app/ui"

export function ProductionMeetingStage({ project }: { project: Project }) {
  const pm = project.productionMeeting

  useEffect(() => {
    if (pm?.decision === "approved") {
      setTimeout(() => {
        fetch(`/api/projects/${project.id}/workflow/auto`, { method: "POST" }).catch((e) => console.error("Auto workflow failed:", e))
      }, 1000)
    }
  }, [pm?.decision, project.id])

  if (!pm) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 4" title="Production Meeting" desc="Team and client align on scope and approach." />
        <div style={{ padding: 24 }}><Empty title="No production meeting yet" hint="The system will generate a production plan automatically." /></div>
      </Panel>
    )
  }

  return (
    <div className="stack gap-5">
      <Panel>
        <PanelHeader eyebrow="Stage 4" title="Production Meeting" desc="AI-generated production plan. Proposal generation starting automatically." actions={<StatusPill status={pm.decision === "approved" ? "approved" : "review"} />} />
        <div style={{ padding: 24 }} className="stack gap-4">
          <p style={{ color: "var(--ink-2)", lineHeight: 1.65 }}>{pm.notes}</p>

          <div style={{ padding: 16, background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>
            {pm.decision === "approved"
              ? "Production plan approved. The proposal and quote are being generated automatically."
              : "The system is processing this stage and will proceed with proposal generation."}
          </div>
        </div>
      </Panel>
    </div>
  )
}
