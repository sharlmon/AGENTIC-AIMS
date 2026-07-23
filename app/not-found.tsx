import Link from "next/link"
import { PageHead, PageWrap } from "@/components/app/Page"

export default function NotFoundPage() {
  return (
    <PageWrap>
      <PageHead eyebrow="404" title="Page not found" desc="The page you are looking for does not exist or has been moved." />
      <div className="panel-soft" style={{ padding: 48, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: "3rem", fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>404</p>
        <p style={{ color: "var(--ink-2)", fontWeight: 500, marginBottom: 6 }}>This page does not exist</p>
        <p className="tiny muted" style={{ marginBottom: 20 }}>It may have been archived, renamed, or the link is incorrect.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-signal btn-sm">Go home</Link>
          <Link href="/dashboard/overview" className="btn btn-ghost btn-sm">Open dashboard</Link>
        </div>
      </div>
    </PageWrap>
  )
}
