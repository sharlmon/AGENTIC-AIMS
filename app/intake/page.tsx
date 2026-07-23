"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Panel } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"
import { Sparkles, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Zap, ShieldCheck } from "lucide-react"

export default function IntakePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", email: "", name: "", context: "" })
  const [showOptional, setShowOptional] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [enrichedResult, setEnrichedResult] = useState<any>(null)
  const [stepText, setStepText] = useState("Analyzing project title & goal...")

  const submitMicroSpark = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.title || !form.email) {
      setError("Please provide your project title and email.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setStepText("AI is inferring company & industry details...")

    try {
      setTimeout(() => setStepText("Building AI brief & initial scope..."), 1200)

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit request")
      }

      const data = await res.json()
      setEnrichedResult(data)
      setStatus("success")

      // Auto-redirect to project space after 2.5s
      setTimeout(() => {
        const savedRole = localStorage.getItem("synthos_user_role")
        if (savedRole === "creator") {
          router.push(`/dashboard/projects/${data.projectId}`)
        } else {
          router.push(`/public/project/${data.projectId}`)
        }
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setStatus("error")
    }
  }

  return (
    <PageWrap>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 0" }}>
        <PageHead
          eyebrow="30-Second Micro-Spark Intake"
          title="Start your project in 10 seconds"
          desc="Tell us your core goal and email. Our AI automatically enriches your company profile, scope, and objectives behind the scenes."
        />

        {status === "success" ? (
          <Panel>
            <div style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", display: "grid", placeItems: "center", margin: "0 auto 20px"
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "#ffffff" }}>
                AI Auto-Enrichment Complete!
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", marginBottom: 28 }}>
                We inferred company <strong>{enrichedResult?.enrichedData?.industry || "Technology"}</strong> details and generated your project brief.
              </p>

              {enrichedResult?.enrichedData?.aiWants && (
                <div style={{
                  background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "16px", padding: "20px",
                  textAlign: "left", marginBottom: 28
                }}>
                  <span className="eyebrow" style={{ color: "#818cf8", marginBottom: 10, display: "block" }}>
                    <Sparkles size={14} /> AI Inferred Objectives
                  </span>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {enrichedResult.enrichedData.aiWants.map((want: string, idx: number) => (
                      <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.86rem", color: "var(--ink)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8" }} />
                        {want}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                Redirecting to your project space...
              </p>
            </div>
          </Panel>
        ) : (
          <form onSubmit={submitMicroSpark}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "24px",
              padding: "36px",
              boxShadow: "var(--shadow-md)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Field 1: Project Title / Core Goal */}
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                    Project Title or Core Goal <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <VoiceInput
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder="e.g. Mobile Banking App Redesign or Brand Strategy 2026"
                  />
                </div>

                {/* Field 2: Email */}
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                    Your Contact Email <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. alex@acmecorp.com"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--line)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      width: "100%",
                    }}
                  />
                  <span style={{ fontSize: "0.76rem", color: "var(--ink-3)", display: "block", marginTop: 6 }}>
                    AI will use your domain to automatically infer company details & scope.
                  </span>
                </div>

                {/* Collapsible Optional Details */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowOptional(!showOptional)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none",
                      color: "var(--ink-2)", fontSize: "0.84rem", fontWeight: 500, cursor: "pointer", padding: 0
                    }}
                  >
                    {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showOptional ? "Hide optional fields" : "+ Add optional details (Name, Voice Note, Extra Context)"}
                  </button>

                  {showOptional && (
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16, padding: 16, background: "var(--surface-2)", borderRadius: "14px", border: "1px solid var(--line)" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-2)", marginBottom: 6 }}>Your Name (Optional)</label>
                        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alex Rivera" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-2)", marginBottom: 6 }}>Additional Context or Voice Note (Optional)</label>
                        <VoiceInput value={form.context} onChange={(v) => setForm({ ...form, context: v })} placeholder="Speak or type any extra preferences..." rows={2} />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p style={{ color: "#f87171", fontSize: "0.84rem", fontWeight: 500 }}>{error}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn btn-signal btn-lg"
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {status === "loading" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Zap size={18} className="spin" /> {stepText}
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      Launch Project Intelligence <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </PageWrap>
  )
}
