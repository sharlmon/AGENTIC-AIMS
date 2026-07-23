export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { StatusPill, AttrTag, Empty } from "@/components/app/ui"

export default async function ProposalsPage() {
  const projects = await getProjects()
  const withProps = projects.filter((p) => p.proposal && (Array.isArray(p.proposal.sections) ? p.proposal.sections.length > 0 : !!p.proposal.overview))
  return (
    <PageWrap>
      <PageHead eyebrow="Delivery" title="Proposals" desc="AI-drafted, human-edited, human-approved. Every proposal shows who contributed what." />
      {withProps.length === 0 ? (
        <Empty title="No proposals yet" hint="The AI builds proposals after synthesis in a project workspace." />
      ) : (
        <div className="feat-list">
          {withProps.map((p: any) => (
             <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="feat-row feat-row--4col">
              <div className="stack gap-1">
                <span className="tiny muted">{p.client}</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</span>
              </div>
              <div className="row gap-2 wrap"><AttrTag attr="mixed" /></div>
              <StatusPill status={p.proposal.status} />
              <span className="btn btn-subtle btn-sm">Open</span>
            </Link>
          ))}
        </div>
      )}
    </PageWrap>
  )
}
