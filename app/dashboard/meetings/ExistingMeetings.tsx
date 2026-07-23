"use client"

import Link from "next/link"
import { Empty } from "@/components/app/ui"

export default function ExistingMeetings({ projects }: { projects: any[] }) {
  const withCalls = projects.filter((p) => p.call && p.call.participants && p.call.participants.length > 0)
  return (
    <>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)" }}>Recent external meetings</h2>
      {withCalls.length === 0 ? (
        <Empty title="No external meetings captured" hint="Paste your first transcript above." />
      ) : (
        <div className="feat-list">
          {withCalls.map((p: any) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="feat-row feat-row--4col">
              <div className="stack gap-1">
                <span className="tiny muted">{p.client}</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</span>
              </div>
              <div className="tiny"><span className="eyebrow">Source</span><p style={{ color: "var(--ink-2)", marginTop: 2 }}>{p.call?.meetingSource || "embedded"}</p></div>
              <div className="tiny"><span className="eyebrow">Date</span><p style={{ color: "var(--ink-2)", marginTop: 2 }}>{p.call?.date}</p></div>
              <span className="btn btn-subtle btn-sm">Open</span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
