export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/blog.css"

export default async function CareersPage() {
  const rawCareers = await prisma.career.findMany({
    where: { status: "open" },
    orderBy: { publishedAt: "desc" },
  })
  const careers = rawCareers.map((c) => ({
    ...c,
    publishedAt: c.publishedAt ? c.publishedAt.toISOString() : undefined,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <PageWrap>
      <PageHead eyebrow="Careers" title="Join Us" desc="Help us build the future of creative intelligence. Explore open positions." />
      <div className="blog-grid">
        {careers.map((career) => (
          <article key={career.id} className="blog-card">
            <div className="blog-card-body">
              <span className="eyebrow" style={{ textTransform: "capitalize" }}>{career.type}</span>
              <h3>{career.title}</h3>
              <p className="tiny muted" style={{ marginBottom: 8 }}>{career.description}</p>
              <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
                {career.location && <span className="chip">{career.location}</span>}
                {career.salaryMin && career.salaryMax && (
                  <span className="chip">${career.salaryMin} – ${career.salaryMax}</span>
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, color: "var(--ink-2)" }}>Requirements:</h4>
                <ul className="stack gap-1">
                  {Array.isArray(career.requirements) && (career.requirements as string[]).slice(0, 4).map((req: string, i: number) => (
                    <li key={i} className="tiny" style={{ color: "var(--ink-3)", paddingLeft: 14, position: "relative" }}>• {req}</li>
                  ))}
                </ul>
              </div>
              <Link href={`mailto:careers@synthos.studio?subject=Application: ${career.title}`} className="btn btn-signal btn-sm">
                Apply Now →
              </Link>
            </div>
          </article>
        ))}
        {careers.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No open positions right now. Check back later.</p>
          </div>
        )}
      </div>
    </PageWrap>
  )
}
