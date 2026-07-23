export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/app/DashboardShell"
import { PageHead } from "@/components/app/Page"

const STAGES = [
  { id: "brief", label: "Brief", color: "#8e8e93" },
  { id: "call", label: "First Meeting", color: "#4a90d9" },
  { id: "contactReport", label: "Contact Report", color: "#5b9bd5" },
  { id: "productionMeeting", label: "Production Meeting", color: "#7b68ee" },
  { id: "proposal", label: "Proposal", color: "#e67e22" },
  { id: "quote", label: "Quote", color: "#27ae60" },
  { id: "approval", label: "Approval", color: "#2ecc71" },
]

export default async function PipelinePage() {
  const projects = await prisma.project.findMany({
    include: { quote: true, proposal: true, owner: true },
    orderBy: { updatedAt: "desc" },
  })

  const totalValue = projects.reduce((sum, p) => {
    if (p.quote?.services && Array.isArray(p.quote.services)) {
      const qTotal = p.quote.services.reduce((a: number, s: any) => a + (s.qty || 0) * (s.rate || 0), 0)
      return sum + qTotal
    }
    return sum
  }, 0)

  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = projects.filter(p => p.stage === stage.id)
    return acc
  }, {} as Record<string, typeof projects>)

  return (
    <DashboardShell>
      <div className="admin-content">
        <PageHead
          eyebrow="Dashboard"
          title="Pipeline"
          desc="Revenue pipeline from intake to signed gig."
          actions={
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-2)" }}>
                {projects.length} projects · ${totalValue.toLocaleString()} pipeline
              </div>
            </div>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          {STAGES.map((stage) => {
            const count = byStage[stage.id]?.length || 0
            const stageValue = byStage[stage.id]?.reduce((sum, p) => {
              if (p.quote?.services && Array.isArray(p.quote.services)) {
                return sum + p.quote.services.reduce((a: number, s: any) => a + (s.qty || 0) * (s.rate || 0), 0)
              }
              return sum
            }, 0) || 0
            return (
              <div key={stage.id} style={{ background: "var(--bg)", border: "2px solid var(--ink)", padding: 18 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: stage.color, marginBottom: 8 }}>
                  {stage.label}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)" }}>
                  {count}
                </div>
                {stageValue > 0 && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-2)", marginTop: 4 }}>
                    ${stageValue.toLocaleString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {STAGES.map((stage) => (
            <div key={stage.id} style={{ background: "var(--bg)", border: "2px solid var(--ink)" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: stage.color, fontWeight: 700 }}>
                  {stage.label}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--ink-3)" }}>
                  {(byStage[stage.id]?.length || 0)}
                </span>
              </div>
              <div style={{ padding: 12 }}>
                {(byStage[stage.id]?.length || 0) === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)", fontSize: "0.82rem" }}>
                    No projects
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {byStage[stage.id]?.map((p) => (
                      <a
                        key={p.id}
                        href={`/dashboard/projects/${p.id}`}
                        style={{ display: "block", padding: 14, background: "var(--surface-2)", border: "1px solid var(--line)", textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem", marginBottom: 4 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--ink-2)", marginBottom: 6 }}>
                          {p.client}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase",
                            letterSpacing: "0.05em", padding: "2px 8px", background: "var(--bg)", border: "1px solid var(--line)",
                            color: p.status === "active" ? "var(--signal)" : p.status === "review" ? "#e67e22" : p.status === "complete" ? "#27ae60" : "var(--ink-3)"
                          }}>
                            {p.status}
                          </span>
                          {p.owner && (
                            <span style={{ fontSize: "0.7rem", color: "var(--ink-3)" }}>
                              {p.owner.name}
                            </span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
