import * as React from "react"
import { cn } from "@/lib/utils"
import { VoiceInput } from "@/components/app/VoiceInput"

export function Panel({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel", className)} {...p}>
      {children}
    </div>
  )
}

export function PanelHeader({
  eyebrow,
  title,
  desc,
  actions,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  desc?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--line)]", className)}>
      <div className="stack gap-1">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h3 style={{ fontSize: "1.25rem" }}>{title}</h3>
        {desc && <p className="muted tiny" style={{ maxWidth: 620 }}>{desc}</p>}
      </div>
      {actions && <div className="row gap-2 shrink-0 wrap">{actions}</div>}
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "background:var(--draft-soft);color:var(--draft);border:1px solid var(--line-strong)" },
    review: { label: "In review", cls: "background:var(--review-soft);color:var(--review);border:1px solid color-mix(in srgb,var(--review) 25%,transparent)" },
    approved: { label: "Approved", cls: "background:var(--approved-soft);color:var(--approved);border:1px solid color-mix(in srgb,var(--approved) 25%,transparent)" },
    rejected: { label: "Rejected", cls: "background:var(--rejected-soft);color:var(--rejected);border:1px solid color-mix(in srgb,var(--rejected) 25%,transparent)" },
    attention: { label: "Needs attention", cls: "background:var(--review-soft);color:var(--review);border:1px solid color-mix(in srgb,var(--review) 25%,transparent)" },
    active: { label: "Active", cls: "background:var(--human-soft);color:var(--human-ink);border:1px solid color-mix(in srgb,var(--human) 22%,transparent)" },
    complete: { label: "Complete", cls: "background:var(--approved-soft);color:var(--approved);border:1px solid color-mix(in srgb,var(--approved) 25%,transparent)" },
  }
  const s = map[status] ?? map.draft
  return (
    <span className="chip" style={{ ...cssToObj(s.cls) }}>
      <span className="dot" style={{ background: "currentColor" }} /> {s.label}
    </span>
  )
}

export function AttrTag({ attr }: { attr: "ai" | "human" | "mixed" }) {
  if (attr === "ai") return <span className="tag-ai"><span className="dot dot-ai" /> AI</span>
  if (attr === "human") return <span className="tag-human"><span className="dot dot-human" /> Human</span>
  return <span className="chip" style={{ color: "var(--signal-ink)", background: "var(--signal-soft)" }}>Human + AI</span>
}

export function Progress({ value, tone = "brand" }: { value: number; tone?: "brand" | "ai" | "human" }) {
  const color = tone === "ai" ? "var(--ai)" : tone === "human" ? "var(--human)" : "var(--brand)"
  return (
    <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s var(--ease)" }} />
    </div>
  )
}

export function Confidence({ value }: { value: number }) {
  const tone = value >= 75 ? "var(--human)" : value >= 50 ? "var(--signal)" : "var(--rejected)"
  return (
    <div className="row gap-2" title={`AI confidence ${value}%`}>
      <span className="tiny muted" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>AI confidence</span>
      <div style={{ width: 90, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: tone, borderRadius: 999 }} />
      </div>
      <span className="mono tiny" style={{ color: tone, fontWeight: 600 }}>{value}%</span>
    </div>
  )
}

export function InsightCard({
  insight,
  onStatus,
  onEdit,
  compact,
}: {
  insight: { id: string; text: string; attr: string; status: string; note?: string }
  onStatus?: (s: any) => void
  onEdit?: (text: string) => void
  compact?: boolean
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(insight.text)
  return (
    <div
      className="panel-soft"
      style={{
        padding: compact ? 12 : 16,
        borderLeft: `3px solid ${
          insight.attr === "ai" ? "var(--ai)" : insight.attr === "human" ? "var(--human)" : "var(--signal)"
        }`,
      }}
    >
      <div className="row between gap-3" style={{ alignItems: "flex-start" }}>
        <div className="stack gap-2 grow">
          <AttrTag attr={insight.attr as any} />
          {editing ? (
            <VoiceInput value={draft} onChange={(v) => setDraft(v)} style={{ minHeight: 60, width: "100%" }} />
          ) : (
            <p style={{ color: "var(--ink-2)", fontSize: "0.92rem" }}>{insight.text}</p>
          )}
        </div>
        <StatusPill status={insight.status} />
      </div>
      {insight.note && <p className="tiny muted" style={{ marginTop: 8 }}>{insight.note}</p>}
      {onStatus && (
        <div className="row gap-2 wrap" style={{ marginTop: 12 }}>
          {editing ? (
            <>
              <button className="btn btn-subtle btn-sm" onClick={() => { onEdit?.(draft); setEditing(false) }}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(insight.text); setEditing(false) }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-subtle btn-sm" onClick={() => onStatus("approved")}>Approve</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onStatus("rejected")}>Reject</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onStatus("review")}>Request revision</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="panel-soft" style={{ padding: 28, textAlign: "center" }}>
      <p style={{ color: "var(--ink-2)", fontWeight: 500 }}>{title}</p>
      {hint && <p className="tiny muted" style={{ marginTop: 6 }}>{hint}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}

export function ErrorState({ title, message, onRetry, style }: { title?: string; message?: string; onRetry?: () => void; style?: React.CSSProperties }) {
  return (
    <div className="panel-soft" style={{ padding: 28, textAlign: "center", border: "1px solid var(--rejected)", ...style }}>
      <p style={{ color: "var(--rejected)", fontWeight: 600, marginBottom: 4 }}>{title || "Something went wrong"}</p>
      {message && <p className="tiny muted" style={{ marginTop: 4 }}>{message}</p>}
      {onRetry && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={onRetry}>Try again</button>
      )}
    </div>
  )
}

export function NotFound({ title, hint, backHref, backLabel }: { title?: string; hint?: string; backHref?: string; backLabel?: string }) {
  return (
    <div className="panel-soft" style={{ padding: 28, textAlign: "center" }}>
      <p style={{ color: "var(--ink-2)", fontWeight: 600, fontSize: "0.95rem" }}>{title || "Not found"}</p>
      {hint && <p className="tiny muted" style={{ marginTop: 6 }}>{hint}</p>}
      {backHref && (
        <a href={backHref} className="btn btn-ghost btn-sm" style={{ marginTop: 12, display: "inline-flex" }}>{backLabel || "Go back"}</a>
      )}
    </div>
  )
}

function cssToObj(css: string) {
  return Object.fromEntries(css.split(";").filter(Boolean).map((d) => {
    const [k, v] = d.split(":")
    return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()]
  }))
}
