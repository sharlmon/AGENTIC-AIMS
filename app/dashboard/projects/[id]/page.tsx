import { toUIProject } from "@/lib/adapters"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProject } from "@/lib/data-server"
import { STAGES, type StageId } from "@/lib/types"
import { WorkflowRail } from "@/components/app/WorkflowRail"
import { PageWrap } from "@/components/app/Page"
import { Panel, PanelHeader, StatusPill, Progress, Confidence, Empty } from "@/components/app/ui"
import "./workspace.css"
import "@/components/app/workflow.css"
import { BriefStage } from "./stages/brief"
import { CallStage } from "./stages/call"
import { ContactReportStage } from "./stages/contactReport"
import { ProductionMeetingStage } from "./stages/productionMeeting"
import { ProposalStage } from "./stages/proposal"
import { QuoteStage } from "./stages/quote"
import { ApprovalStage } from "./stages/approval"
import { AdvanceForm } from "./AdvanceForm"

function stageLabel(s: any) {
  return s.stage.replace(/([A-Z])/g, " $1").replace(/^./, (m: string) => m.toUpperCase())
}

const VIEWS: Record<string, (p: any) => React.ReactNode> = {
  brief: (p) => <BriefStage project={p} />,
  call: (p) => <CallStage project={p} />,
  contactReport: (p) => <ContactReportStage project={p} />,
  productionMeeting: (p) => <ProductionMeetingStage project={p} />,
  proposal: (p) => <ProposalStage project={p} />,
  quote: (p) => <QuoteStage project={p} />,
  approval: (p) => <ApprovalStage project={p} />,
}

export default async function ProjectWorkspace({ params }: { params: { id: string } }) {
  const raw = await getProject(params.id)
  if (!raw) {
    return (
      <PageWrap>
        <Empty title="Project not found" hint="It may have been archived." />
        <div style={{ marginTop: 16 }}><Link href="/dashboard/projects" className="btn btn-ghost">Back to projects</Link></div>
      </PageWrap>
    )
  }
  const project = toUIProject(raw)

  const curIdx = STAGES.findIndex((s) => s.id === project.stage)
  const next = STAGES[Math.min(curIdx + 1, STAGES.length - 1)]

  return (
    <div className="ws">
      <div className="ws-top container">
        <div className="row gap-2 wrap" style={{ marginBottom: 10 }}>
          <Link href="/dashboard/projects" className="tiny muted">Projects</Link>
          <span className="tiny muted">/</span>
          <span className="tiny" style={{ color: "var(--ink-2)" }}>{project.name}</span>
        </div>
        <div className="ws-head">
          <div className="stack gap-1 grow">
            <span className="eyebrow">{project.type}</span>
            <h1 className="display" style={{ fontSize: "clamp(1.7rem,2.6vw,2.3rem)" }}>{project.name}</h1>
            <p className="tiny muted">{project.client} · Owner · {stageLabel(project)}</p>
          </div>
          <div className="ws-head-right">
            <StatusPill status={project.status} />
            <AdvanceForm projectId={project.id} nextStage={next.id} nextLabel={next.label} />
          </div>
        </div>
        <div className="ws-progress">
          <Progress value={project.progress} />
          <span className="mono tiny muted">{project.progress}%</span>
        </div>
      </div>

      <div className="ws-body container">
        <aside className="ws-rail">
          <WorkflowRail current={project.stage} baseHref={`/dashboard/projects/${project.id}`} />
        </aside>
      <section className="ws-main fade-up" key={project.stage}>
        {VIEWS[project.stage] ? VIEWS[project.stage](project) : <div className="panel-soft" style={{ padding: 40, textAlign: "center" }}><p>Stage not found: {project.stage}</p></div>}
      </section>
      </div>
    </div>
  )
}
