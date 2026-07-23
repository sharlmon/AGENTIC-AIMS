"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import { STAGES, type Insight, type Project, type StageId, type Status } from "./types"

interface State {
  projects: Project[]
}

type Action =
  | { type: "setInsightStatus"; projectId: string; group: string; id: string; status: Status }
  | { type: "editInsight"; projectId: string; group: string; id: string; text: string }
  | { type: "advanceStage"; projectId: string }
  | { type: "setStage"; projectId: string; stage: StageId }

function withProject(state: State, id: string, fn: (p: Project) => Project): State {
  return { projects: state.projects.map((p) => (p.id === id ? fn(p) : p)) }
}

function mapGroup(p: Project, group: string, fn: (list: Insight[]) => Insight[]): Project {
  const g = (p as any)[group] as Insight[] | undefined
  if (!Array.isArray(g)) return p
  return { ...p, [group]: fn(g) }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setInsightStatus":
      return withProject(state, action.projectId, (p) =>
        mapGroup(p, action.group, (list) =>
          list.map((i) => (i.id === action.id ? { ...i, status: action.status } : i))
        )
      )
    case "editInsight":
      return withProject(state, action.projectId, (p) =>
        mapGroup(p, action.group, (list) =>
          list.map((i) => (i.id === action.id ? { ...i, text: action.text } : i))
        )
      )
    case "setStage":
      return withProject(state, action.projectId, (p) => {
        const idx = STAGES.findIndex((s) => s.id === action.stage)
        return {
          ...p,
          stage: action.stage,
          progress: Math.max(p.progress, Math.round((idx / (STAGES.length - 1)) * 100)),
        }
      })
    case "advanceStage":
      return withProject(state, action.projectId, (p) => {
        const idx = STAGES.findIndex((s) => s.id === p.stage)
        const next = STAGES[Math.min(idx + 1, STAGES.length - 1)]
        return { ...p, stage: next.id, progress: Math.round((next.index / STAGES.length) * 100) }
      })
    default:
      return state
  }
}

const StoreContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { projects: [] })
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export function useProject(id: string) {
  const { state } = useStore()
  return state.projects.find((p) => p.id === id)
}
