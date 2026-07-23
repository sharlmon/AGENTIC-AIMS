"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AdvanceForm({ projectId, nextStage, nextLabel }: { projectId: string; nextStage: string; nextLabel: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const advance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/workflow/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto" }),
      })
      if (!res.ok) throw new Error("Failed to advance workflow")
      router.refresh()
    } catch (e) {
      console.error("Failed to advance workflow:", e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <button className="btn btn-signal" onClick={advance} disabled={loading}>
      {loading ? "Processing…" : `Continue to ${nextLabel} →`}
    </button>
  )
}
