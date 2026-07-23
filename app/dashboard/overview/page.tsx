export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Panel, PanelHeader, StatusPill, Progress, Confidence, Empty } from "@/components/app/ui"
import CreateProjectForm from "./CreateProjectForm"
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
        eyebrow="Workspace"
        title="What needs your attention next?"
        desc="A calm view of every active project, where the AI has moved things forward, and what only a human can decide."
        actions={
          <>
            <Link href="/dashboard/projects" className="btn btn-ghost">All projects</Link>
            <Link href="/dashboard/approvals" className="btn btn-signal">Review approvals · {awaitingApproval.length}</Link>
          </>
        }
      />

      <div className="ov-stats">
        <Stat label="Active projects" value={projects.length} sub="across clients" />
        <Stat label="AI activity" value={totalAI} sub="insights this week" tone="ai" />
        <Stat label="Needs attention" value={needsAttention.length} sub="review required" tone="signal" />
        <Stat label="Awaiting approval" value={awaitingApproval.length} sub="human decision" tone="human" />
      </div>

      {(projects || []).length === 0 ? (
        <Panel>
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty title="No projects yet" hint="Create your first project to start the workflow." />
            <div style={{ marginTop: 18 }}><CreateProjectForm /></div>
          </div>
        </Panel>
      ) : (
        <div className="ov-grid">
          <section className="stack gap-4">
            <h3 className="section-title">Projects requiring attention</h3>
            {needsAttention.length === 0 && <p className="muted tiny">Nothing urgent — all projects are progressing smoothly.</p>}
            {needsAttention.map((p: any) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="ov-card">
                <div className="row between gap-3">
                  <div className="stack gap-1">
                    <span className="ov-card-title">{p.name}</span>
                    <span className="tiny muted">{p.client} · {stageLabel(p)}</span>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <p className="tiny muted" style={{ marginTop: 10 }}>Next: {p.nextAction}</p>
                <div style={{ marginTop: 12 }}><Progress value={p.progress} /></div>
              </Link>
            ))}

            <h3 className="section-title" style={{ marginTop: 8 }}>Awaiting human approval</h3>
            {awaitingApproval.map((p: any) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="ov-approve">
                <span className="dot dot-attention" />
                <div className="grow">
                  <span className="ov-card-title" style={{ fontSize: "0.95rem" }}>{p.name}</span>
                  <span className="tiny muted" style={{ display: "block" }}>
                    {p.proposal?.status === "review" ? "Proposal ready for review · " : ""}
                    {p.quote?.status === "review" ? "Quote ready for review · " : ""}
                    {p.client}
                  </span>
                </div>
                <span className="btn btn-subtle btn-sm">Open</span>
              </Link>
            ))}
          </section>

          <aside className="stack gap-4">
            <Panel>
              <PanelHeader eyebrow="Quick actions" title="Move work forward" />
              <div className="stack gap-2" style={{ padding: 16 }}>
                <CreateProjectForm />
              </div>
            </Panel>

            <Panel>
              <PanelHeader eyebrow="Principle" title="Human + AI" />
              <div className="hai-box">
                <div><span className="tag-ai"><span className="dot dot-ai" /> AI assists</span><p className="tiny muted" style={{ marginTop: 8 }}>Understands briefs, analyses calls, synthesises intelligence.</p></div>
                <div style={{ margin: "4px 0" }} className="hai-div" />
                <div><span className="tag-human"><span className="dot dot-human" /> Humans decide</span><p className="tiny muted" style={{ marginTop: 8 }}>Review, edit, and approve every output before it ships.</p></div>
              </div>
            </Panel>
          </aside>
        </div>
      )}
    </PageWrap>
  )
}

function Stat({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: "ai" | "signal" | "human" }) {
  const c = tone === "ai" ? "var(--ai)" : tone === "signal" ? "var(--signal)" : tone === "human" ? "var(--human)" : "var(--ink)"
  return (
    <div className="ov-stat panel">
      <span className="eyebrow">{label}</span>
      <span className="ov-stat-value" style={{ color: c }}>{value}</span>
      <span className="tiny muted">{sub}</span>
    </div>
  )
}
