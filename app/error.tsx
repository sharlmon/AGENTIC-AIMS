"use client"

import { useEffect } from "react"
import Link from "next/link"
import { PageHead, PageWrap } from "@/components/app/Page"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <PageWrap>
      <PageHead eyebrow="Error" title="Something went wrong" desc="An unexpected error occurred while loading this page." />
      <div className="panel-soft" style={{ padding: 48, textAlign: "center", maxWidth: 480, margin: "0 auto", border: "1px solid var(--rejected)" }}>
        <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--rejected)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>Error</p>
        <p style={{ color: "var(--ink-2)", fontWeight: 500, marginBottom: 6 }}>We could not load this page</p>
        <p className="tiny muted" style={{ marginBottom: 4 }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="mono tiny" style={{ color: "var(--ink-3)", marginBottom: 20 }}>Ref: {error.digest}</p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-signal btn-sm" onClick={reset}>Try again</button>
          <Link href="/" className="btn btn-ghost btn-sm">Go home</Link>
        </div>
      </div>
    </PageWrap>
  )
}
