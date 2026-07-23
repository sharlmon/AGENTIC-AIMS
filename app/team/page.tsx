export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead, PageWrap } from "@/components/app/Page"
import Image from "next/image"
import "@/components/app/blog.css"

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { availability: { not: "unavailable" } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <PageWrap>
      <PageHead eyebrow="Team" title="Our Team" desc="The people behind Synthos. Creative writers, producers, and account managers dedicated to your success." />
      <div className="blog-grid">
        {members.map((member) => (
          <article key={member.id} className="blog-card">
            <div style={{ width: "100%", height: 180, position: "relative", background: "var(--surface-2)", borderRadius: "var(--r-md) var(--r-md) 0 0", overflow: "hidden" }}>
              {member.avatar ? (
                <Image src={member.avatar} alt={member.name} fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 700, color: "var(--ink-3)" }}>
                  {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="blog-card-body">
              <span className="eyebrow" style={{ textTransform: "capitalize" }}>{member.role.replace("_", " ")}</span>
              <h3>{member.name}</h3>
              <p className="tiny muted" style={{ marginBottom: 8 }}>{member.email}</p>
              {member.description && <p className="tiny" style={{ color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.55 }}>{member.description}</p>}
              {Array.isArray(member.skills) && (member.skills as string[]).length > 0 && (
                <div className="row gap-2 wrap" style={{ marginBottom: 12 }}>
                  {(member.skills as string[]).slice(0, 4).map((skill: string) => (
                    <span key={skill} className="chip">{skill}</span>
                  ))}
                </div>
              )}
              {member.notes && <p className="tiny" style={{ color: "var(--ink-3)", marginTop: 8 }}>{member.notes}</p>}
              <div style={{ marginTop: 14 }}>
                <span className={`admin-badge admin-badge-${member.availability === "available" ? "active" : member.availability === "busy" ? "review" : "draft"}`}>
                  {member.availability}
                </span>
              </div>
            </div>
          </article>
        ))}
        {members.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
            <p className="muted">No team members listed yet.</p>
          </div>
        )}
      </div>
    </PageWrap>
  )
}
