"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, StatusPill } from "@/components/app/ui"

type Notification = {
  id: string
  title: string
  message: string
  kind: string
  refId?: string
  read: boolean
  createdAt: string
}

export default function MessagesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  if (loading) {
    return (
      <PageWrap>
        <PageHead eyebrow="Communication" title="Messages" desc="Your notifications, proposals, quotes, and contact reports." />
        <div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading messages…</p></div>
      </PageWrap>
    )
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <PageWrap>
      <PageHead
        eyebrow="Communication"
        title="Messages"
        desc="Your notifications, proposals, quotes, and contact reports."
        actions={<span className="tag-human"><span className="dot dot-human" /> {unread} unread</span>}
      />

      {notifications.length === 0 ? (
        <Empty title="No messages yet" hint="Notifications and messages will appear here as projects progress through the workflow." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`panel-soft ${!n.read ? "notif-item--unread" : ""}`}
              style={{
                padding: 18,
                cursor: "pointer",
                borderLeft: !n.read ? "3px solid var(--signal)" : "1px solid var(--line)",
                background: !n.read ? "var(--surface-2)" : "var(--bg)",
              }}
              onClick={() => markAsRead(n.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: !n.read ? 600 : 400, color: "var(--ink)", fontSize: "0.92rem" }}>{n.title}</span>
                    <StatusPill status={n.kind === "approval" ? "review" : n.kind === "message" ? "active" : "draft"} />
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{n.message}</p>
                  <span className="tiny muted" style={{ marginTop: 6, display: "block" }}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {n.refId && (
                  <Link href={`/dashboard/projects/${n.refId}`} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                    Open
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrap>
  )
}
