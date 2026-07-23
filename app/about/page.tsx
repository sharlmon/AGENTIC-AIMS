export const dynamic = 'force-dynamic'

import { PageHead, PageWrap } from "@/components/app/Page"

export default function AboutPage() {
  return (
    <PageWrap>
      <PageHead eyebrow="Company" title="About AIMS" desc="The operating system for creative intelligence. AI accelerates the work — humans provide the judgment." />

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="section-title">Our Mission</div>
        <p style={{ fontSize: "1.05rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 32 }}>
          AIMS was built to solve a fundamental problem in creative agencies: the gap between client conversations and structured project intelligence. We believe AI should handle the workflow so humans can focus on what they do best — creativity, judgment, and relationships.
        </p>

        <div className="section-title">What We Do</div>
        <p style={{ fontSize: "1.05rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 32 }}>
          Our platform transforms client briefs, meetings, and transcripts into actionable project intelligence. From the first creative brief to final human approval, every step is tracked, attributed, and optimized. AI drafts — humans decide.
        </p>

        <div className="section-title">Who We Serve</div>
        <p style={{ fontSize: "1.05rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 32 }}>
          Modern creative agencies, brand teams, and production studios that need structure without sacrificing creativity. AIMS fits into your existing workflow and amplifies your team&apos;s output.
        </p>

        <div style={{ padding: 32, background: "var(--surface-2)", border: "1px solid var(--line)", marginTop: 40 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Built In</div>
          <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
            AIMS is designed and developed for creative teams worldwide. We combine cutting-edge AI with proven agency workflows to deliver a platform that feels native to how creative work actually happens.
          </p>
        </div>
      </div>
    </PageWrap>
  )
}
