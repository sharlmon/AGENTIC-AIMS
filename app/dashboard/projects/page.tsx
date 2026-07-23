export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { StatusPill, Progress, Empty, Panel } from "@/components/app/ui"
import CreateProjectForm from "../overview/CreateProjectForm"
import "./app.css"

type View = "grid" | "list"
type Sort = "activity" | "progress" | "name"

function stageLabel(s: any) {
  return s?.stage ? s.stage.replace(/([A-Z])/g, " $1").replace(/^./, (m: string) => m.toUpperCase()) : "—"
}

export default async function ProjectsPage({ searchParams }: { searchParams: { q?: string; view?: string; sort?: string; filter?: string } }) {
  const projects = await getProjects()
  const q = searchParams.q || ""
  const view = (searchParams.view as View) || "grid"
  const sort = (searchParams.sort as Sort) || "activity"
  const filter = searchParams.filter || "all"

  const filtered = (projects || []).filter((p: any) => {
    const matchQ = !q || `${p.name} ${p.client} ${p.type}`.toLowerCase().includes(q.toLowerCase())
    const matchF = filter === "all" || p.status === filter
    return matchQ && matchF
  })
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name)
    if (sort === "progress") return (b.progress || 0) - (a.progress || 0)
    return (b.aiActivity || 0) - (a.aiActivity || 0)
  })

  return (
    <PageWrap>
      <PageHead
        eyebrow="Workspace"
        title="Projects"
        desc="Every client engagement, tracked through the Human + AI workflow from brief to approval."
        actions={<Link href="/dashboard/overview" className="btn btn-ghost">Overview</Link>}
      />

      <form className="proj-toolbar" method="get">
        <div className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input className="input" name="q" placeholder="Search projects, clients, types…" defaultValue={q} style={{ border: "none", padding: "10px 0", background: "transparent" }} />
        </div>
        <div className="row gap-2">
          <select className="select" name="filter" defaultValue={filter} style={{ width: "auto" }}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="attention">Needs attention</option>
            <option value="review">In review</option>
            <option value="complete">Complete</option>
          </select>
          <select className="select" name="sort" defaultValue={sort} style={{ width: "auto" }}>
            <option value="activity">Sort: Recent activity</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: Name</option>
          </select>
          <div className="viewtoggle">
            <button type="submit" name="view" value="grid" className={view === "grid" ? "active" : ""} aria-label="Grid view">▦</button>
            <button type="submit" name="view" value="list" className={view === "list" ? "active" : ""} aria-label="List view">≡</button>
          </div>
        </div>
      </form>

      {(projects || []).length === 0 ? (
        <Panel>
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty title="No projects yet" hint="Create your first project to begin the workflow." />
            <div style={{ marginTop: 18 }}><CreateProjectForm /></div>
          </div>
        </Panel>
      ) : sorted.length === 0 ? (
        <Empty title="No matches" hint="Try adjusting your search or filters." />
      ) : (
        <div className={view === "grid" ? "proj-grid" : "proj-list"}>
          {sorted.map((p: any) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className={view === "grid" ? "proj-card" : "proj-row"}>
              <div className="row between gap-2">
                <span className="proj-type">{p.type}</span>
                <StatusPill status={p.status} />
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: 10 }}>{p.name}</h3>
              <p className="tiny muted">{p.client}</p>
              <div className="proj-stage">
                <span className="dot" style={{ background: "var(--signal)" }} />
                <span className="tiny" style={{ color: "var(--ink-2)", fontWeight: 500 }}>{stageLabel(p)}</span>
              </div>
              <div className="proj-meta">
                <span className="tiny muted">Progress</span>
                <Progress value={p.progress || 0} />
                <span className="mono tiny muted">{p.progress || 0}%</span>
              </div>
              <div className="proj-foot">
                <span className="tiny muted">{new Date(p.lastActivity || Date.now()).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="tiny" style={{ color: "var(--signal-ink)" }}>{p.nextAction || "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageWrap>
  )
}
