"use client"

import type { Project } from "@/lib/types"
import { Panel, PanelHeader, StatusPill, Empty } from "@/components/app/ui"

export function ContactReportStage({ project }: { project: Project }) {
  const report = project.contactReport

  if (!report) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 3" title="Contact Report" desc="AI-generated summary of the first meeting." />
        <div style={{ padding: 24 }}><Empty title="No contact report yet" hint="Complete the first meeting to generate a contact report." /></div>
      </Panel>
    )
  }

  return (
    <div className="stack gap-5">
      <Panel>
        <PanelHeader eyebrow="Stage 3" title="Contact Report" desc="AI-generated summary of the first meeting." actions={<StatusPill status={report.approved ? "approved" : "review"} />} />
        <div style={{ padding: 24 }} className="stack gap-4">
          <p style={{ color: "var(--ink-2)", lineHeight: 1.65 }}>{report.summary}</p>

          {report.keyPoints?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Key Points</h4>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {report.keyPoints.map((kp: string, i: number) => (<li key={i} style={{ color: "var(--ink-2)" }}>{kp}</li>))}
              </ul>
            </div>
          )}

          {report.decisions?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Decisions Made</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.decisions.map((d: string, i: number) => (<div key={i} style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{d}</div>))}
              </div>
            </div>
          )}

          {report.actionItems?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.95rem", marginBottom: 8 }}>Action Items</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.actionItems.map((item: any, i: number) => (
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
          )}

          <div style={{ padding: 16, background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>
            {report.approved
              ? "Contact report approved. The production meeting has been scheduled automatically."
              : "This report is AI-generated and has been sent to the client. The production meeting will be scheduled automatically."}
          </div>
        </div>
      </Panel>
    </div>
  )
}
