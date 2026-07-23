export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Confidence, Empty } from "@/components/app/ui"

function countInsights(p: any) {
  if (!p.understanding) return 0
  const groups = ["wants", "businessObjectives", "creativeObjectives", "constraints", "risks", "missing", "questions"]
  return groups.reduce((a, g) => a + ((p.understanding.insights || []).filter((i: any) => i.group === g).length), 0)
}

export default async function IntelligencePage() {
  const projects = await getProjects()
  const ready = projects.filter((p) => p.understanding && p.understanding.confidence > 0)
  return (
    <PageWrap>
      <PageHead eyebrow="Intelligence" title="AI Intelligence" desc="Structured understanding extracted from every brief, call and transcript. Review and correct before it drives the work." />
      {ready.length === 0 ? (
        <Empty title="No understanding generated yet" hint="Complete a brief and client call to let the AI extract intelligence." />
      ) : (
        <div className="feat-grid">
          {ready.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="feat-card">
              <div className="row between" style={{ marginBottom: 10 }}>
                <span className="feat-tag">Understanding</span>
                <Confidence value={p.understanding!.confidence} />
              </div>
              <h3>{p.name}</h3>
              <p className="tiny" style={{ marginTop: 6 }}>{p.client}</p>
              <div className="row gap-2 wrap" style={{ marginTop: 14 }}>
                <span className="chip">{countInsights(p)} insights</span>
                <span className="chip" style={{ color: "var(--ai-ink)", background: "var(--ai-soft)" }}>AI-drafted</span>
                <span className="chip" style={{ color: "var(--human-ink)", background: "var(--human-soft)" }}>Needs review</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageWrap>
  )
}
