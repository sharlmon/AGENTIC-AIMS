import type { ReactNode } from "react"
import "./page.css"

export function PageHead({
  eyebrow,
  title,
  desc,
  actions,
}: {
  eyebrow?: string
  title: ReactNode
  desc?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="pagehead">
      <div className="stack gap-2 grow">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="display" style={{ fontSize: "clamp(1.9rem,3vw,2.6rem)" }}>{title}</h1>
        {desc && <p className="lede" style={{ maxWidth: 720 }}>{desc}</p>}
      </div>
      {actions && <div className="row gap-2 wrap shrink-0">{actions}</div>}
    </div>
  )
}

export function PageWrap({ children }: { children: ReactNode }) {
  return <div className="container pagewrap">{children}</div>
}
