"use client"

import { STAGES, type StageId } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function WorkflowRail({
  current,
  baseHref,
  onStage,
}: {
  current: StageId
  baseHref: string
  onStage?: (s: StageId) => void
}) {
  const curIdx = STAGES.findIndex((s) => s.id === current)
  return (
    <ol className="workflow-rail">
      {STAGES.map((s, i) => {
        const state = i < curIdx ? "done" : i === curIdx ? "current" : "todo"
        const content = (
          <>
            <span className={cn("wr-node", state)}>{i < curIdx ? "✓" : s.index}</span>
            <span className="wr-text">
              <span className="wr-label">{s.label}</span>
              <span className="wr-desc">{s.description}</span>
            </span>
          </>
        )
        return (
          <li key={s.id} className={cn("wr-item", state)}>
            {onStage ? (
              <button className="wr-btn" onClick={() => onStage(s.id)}>{content}</button>
            ) : (
              <Link className="wr-btn" href={`${baseHref}#${s.id}`}>{content}</Link>
            )}
          </li>
        )
      })}
    </ol>
  )
}
