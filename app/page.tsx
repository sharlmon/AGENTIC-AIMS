import Link from "next/link"
import { BrandMark } from "@/components/app/Header"
import { prisma } from "@/lib/prisma"
import "./home.css"
import "@/components/app/blog.css"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const recentBlog = await prisma.post.findMany({
    where: { kind: "blog", status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 3,
  })

  const recentNews = await prisma.post.findMany({
    where: { kind: "news", status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 3,
  })

  return (
    <main>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">Creative Intelligence Platform</span>
          <h1 className="hero-title">
            AI accelerates the work.<br />
            <span className="hero-human">Humans provide the judgment.</span>
          </h1>
          <p className="hero-lede">
            Synthos turns client conversations and creative briefs into structured project intelligence, strategic direction, proposals, quotes, and human-approved deliverables.
          </p>
          <div className="row gap-3 wrap">
            <Link href="/dashboard/overview" className="btn btn-signal btn-lg">Open workspace →</Link>
            <Link href="/dashboard/projects" className="btn btn-ghost btn-lg">View projects</Link>
          </div>
          <div className="row gap-2 wrap" style={{ marginTop: 22 }}>
            <span className="tag-ai"><span className="dot dot-ai" /> AI assists</span>
            <span className="tag-human"><span className="dot dot-human" /> Humans decide</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="workflow-steps">
            {[
              ["1", "Brief", "Capture client needs and objectives."],
              ["2", "First Meeting", "Discovery call with the client."],
              ["3", "Contact Report", "AI-generated summary for client confirmation."],
              ["4", "Production Meeting", "Team and client align on scope and approach."],
              ["5", "Proposal", "Account manager drafts the proposal."],
              ["6", "Quote", "Professional quote ready for client."],
              ["7", "Approval", "Client accepts and the gig starts."],
            ].map(([n, t, d]) => (
              <div key={n as string} className="wf-step">
                <span className="wf-num">{n as string}</span>
                <h3>{t as string}</h3>
                <p className="tiny muted">{d as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(recentBlog.length > 0 || recentNews.length > 0) && (
        <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, paddingTop: 48 }}>
              <span className="eyebrow">Stay updated</span>
              <div style={{ display: "flex", gap: 12 }}>
                {recentBlog.length > 0 && <Link href="/blog" className="btn btn-ghost btn-sm">All blog posts →</Link>}
                {recentNews.length > 0 && <Link href="/news" className="btn btn-ghost btn-sm">All news →</Link>}
              </div>
            </div>

            {recentBlog.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <span className="eyebrow" style={{ textTransform: "capitalize", color: "var(--signal)", marginBottom: 12, display: "block" }}>Blog</span>
                <div className="blog-grid">
                  {recentBlog.map((post) => (
                    <article key={post.id} className="blog-card">
                      {post.coverImage && (
                        <div className="blog-card-img">
                          <img src={post.coverImage} alt={post.title} />
                        </div>
                      )}
                      <div className="blog-card-body">
                        <span className="eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                        <h3>{post.title}</h3>
                        {post.excerpt && <p className="tiny muted">{post.excerpt}</p>}
                        <Link href={`/blog/${post.slug}`} className="btn btn-ghost btn-sm">Read more →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {recentNews.length > 0 && (
              <div style={{ paddingBottom: 48 }}>
                <span className="eyebrow" style={{ textTransform: "capitalize", color: "var(--ai)", marginBottom: 12, display: "block" }}>News</span>
                <div className="blog-grid">
                  {recentNews.map((post) => (
                    <article key={post.id} className="blog-card">
                      {post.coverImage && (
                        <div className="blog-card-img">
                          <img src={post.coverImage} alt={post.title} />
                        </div>
                      )}
                      <div className="blog-card-body">
                        <span className="eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                        <h3>{post.title}</h3>
                        {post.excerpt && <p className="tiny muted">{post.excerpt}</p>}
                        <Link href={`/news/${post.slug}`} className="btn btn-ghost btn-sm">Read more →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <span className="eyebrow">Built for creative teams</span>
          <h2 className="display" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", marginBottom: 18 }}>The operating system for creative intelligence</h2>
          <p className="lede" style={{ marginBottom: 28 }}>
            From the first creative brief to the final human approval, Synthos keeps the entire creative intelligence workflow in one calm, considered workspace.
          </p>
          <Link href="/dashboard/overview" className="btn btn-signal btn-lg">Get started →</Link>
          <Link href="/intake" className="btn btn-ghost btn-lg">Start a project →</Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="features">
            <div className="feat">
              <h3>Briefs & Calls</h3>
              <p className="tiny muted">Capture client briefs and discovery calls with intelligence built in.</p>
            </div>
            <div className="feat">
              <h3>AI Understanding</h3>
              <p className="tiny muted">The system extracts structured intelligence — wants, objectives, constraints, risks, missing info.</p>
            </div>
            <div className="feat">
              <h3>Workshops</h3>
              <p className="tiny muted">Human + AI collaboration to build strategic direction together.</p>
            </div>
            <div className="feat">
              <h3>Proposals & Quotes</h3>
              <p className="tiny muted">Professional deliverables with clear AI/human attribution on every section.</p>
            </div>
            <div className="feat">
              <h3>Approval Center</h3>
              <p className="tiny muted">A dedicated gate for human review — AI assists, humans decide.</p>
            </div>
            <div className="feat">
              <h3>Workflow Visibility</h3>
              <p className="tiny muted">See every project's stage, progress, and what needs attention next.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section foot-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="display" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", marginBottom: 14 }}>Ready to move work forward?</h2>
          <p className="lede" style={{ marginBottom: 28 }}>Open your workspace and see what needs your attention next.</p>
          <Link href="/dashboard/overview" className="btn btn-signal btn-lg">Open Synthos →</Link>
        </div>
      </section>
    </main>
  )
}
