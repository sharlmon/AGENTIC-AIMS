export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Panel, StatusPill, Progress } from "@/components/app/ui"
import CreateProjectForm from "./CreateProjectForm"
import { Sparkles, Plus, CheckCircle2, ArrowRight } from "lucide-react"
import "./app.css"

function stageLabel(s: any) {
  return s?.stage ? s.stage.replace(/([A-Z])/g, " $1").replace(/^./, (m: string) => m.toUpperCase()) : "—"
}

export default async function OverviewPage() {
  const projects = await getProjects()
  const needsAttention = (projects || []).filter((p: any) => p.status === "attention" || p.status === "review")
  const awaitingApproval = (projects || []).filter(
    (p: any) => (p.proposal?.status === "review" || p.proposal?.status === "draft") || (p.quote?.status === "review" || p.quote?.status === "draft")
  )
  const totalAI = (projects || []).reduce((a: number, p: any) => a + (p.aiActivity || 0), 0)

  return (
    <PageWrap>
      <PageHead
        eyebrow="Workspace Control"
        title="Creator & Workspace Overview"
        desc="A unified, high-contrast view of your active client projects, AI background synthesis, and pending decisions."
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/intake" className="btn btn-signal btn-sm">
              <Plus size={16} /> New Project Request
            </Link>
          </div>
        }
      />

      <div className="ov-stats">
        <Stat label="Active projects" value={projects.length} sub="in pipeline" />
        <Stat label="AI activity" value={totalAI} sub="automated steps" tone="ai" />
        <Stat label="Needs attention" value={needsAttention.length} sub="review required" tone="signal" />
        <Stat label="Awaiting approval" value={awaitingApproval.length} sub="pending client decision" tone="human" />
      </div>

      {(projects || []).length === 0 ? (
        <Panel style={{ marginTop: 24 }}>
          <div style={{ padding: "56px 32px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)", display: "grid", placeItems: "center", margin: "0 auto 20px", color: "#a1a1aa"
            }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 10px", color: "#ffffff" }}>
              Your Workspace is Reset & Ready
            </h3>
            <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", maxWidth: "460px", margin: "0 auto 28px", lineHeight: 1.6 }}>
              There are currently no active projects. Submit a 30-Second Micro-Spark project request to see the AI workflow engine in action.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/intake" className="btn btn-signal">
                Start a Project Request <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="ov-grid" style={{ marginTop: 24 }}>
          <section className="stack gap-4">
            <h3 className="section-title">Active Projects & Workflows</h3>
            {(projects || []).map((p: any) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="ov-card">
                <div className="row between gap-3">
                  <div className="stack gap-1">
                    <span className="ov-card-title">{p.name}</span>
                    <span className="tiny muted">{p.client} · Stage: {stageLabel(p)}</span>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <p className="tiny muted" style={{ marginTop: 10 }}>Next Step: {p.nextAction}</p>
                <div style={{ marginTop: 12 }}><Progress value={p.progress} /></div>
              </Link>
            ))}
          </section>

          <aside className="stack gap-4">
            <Panel>
              <div style={{ padding: "20px" }}>
                <span className="eyebrow" style={{ color: "#818cf8", marginBottom: 8, display: "block" }}>Quick Creation</span>
                <CreateProjectForm />
              </div>
            </Panel>
          </aside>
        </div>
      )}
    </PageWrap>
  )
}

function Stat({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: "ai" | "signal" | "human" }) {
  const c = tone === "ai" ? "#818cf8" : tone === "signal" ? "#f87171" : tone === "human" ? "#34d399" : "#ffffff"
  return (
    <div className="ov-stat panel">
      <span className="eyebrow">{label}</span>
      <span className="ov-stat-value" style={{ color: c }}>{value}</span>
      <span className="tiny muted">{sub}</span>
    </div>
  )
}
