"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Panel } from "@/components/app/ui"
import { VoiceInput } from "@/components/app/VoiceInput"
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react"

export default function CreatorOnboardingPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", role: "Full-Stack Developer", bio: "", portfolio: "", rate: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [stepText, setStepText] = useState("Analyzing creator skills & background...")

  const submitCreatorOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name || !form.email) {
      setError("Please provide your name and email.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setStepText("AI is generating your creator capability profile...")

    try {
      setTimeout(() => setStepText("Registering creator credentials & sending welcome email..."), 1200)

      const res = await fetch("/api/creator/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to complete creator onboarding")
      }

      const data = await res.json()
      setResult(data)
      setStatus("success")

      localStorage.setItem("synthos_user_role", "creator")

      setTimeout(() => {
        router.push("/dashboard/overview")
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
          eyebrow="Synthos Creator Network"
          title="Onboard as a Creator or Agency Lead"
          desc="Set up your developer, designer, or agency profile. Our AI verifies your core capabilities, aligns your talent score, and prepares your Creator Workspace."
        />

        {status === "success" ? (
          <Panel>
            <div style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "rgba(129, 140, 248, 0.15)",
                color: "#818cf8", border: "1px solid rgba(129, 140, 248, 0.3)", display: "grid", placeItems: "center", margin: "0 auto 20px"
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "#ffffff" }}>
                Welcome to the Network, {result?.user?.name || "Creator"}!
              </h3>
              <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", marginBottom: 28 }}>
                We&apos;ve registered your <strong>{result?.enrichedData?.primaryRole || "Developer"}</strong> profile and sent your onboarding welcome email.
              </p>

              {result?.enrichedData?.skills && (
                <div style={{
                  background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "16px", padding: "20px",
                  textAlign: "left", marginBottom: 28
                }}>
                  <span className="eyebrow" style={{ color: "#34d399", marginBottom: 10, display: "block" }}>
                    <Sparkles size={14} /> AI Verified Skills & Capability
                  </span>
                  <p style={{ fontSize: "0.88rem", color: "var(--ink)", marginBottom: 12, lineHeight: 1.6 }}>
                    {result.enrichedData.capabilitiesSummary}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.enrichedData.skills.map((s: string, idx: number) => (
                      <span key={idx} style={{
                        background: "rgba(129, 140, 248, 0.15)", color: "#818cf8", border: "1px solid rgba(129, 140, 248, 0.3)",
                        fontSize: "0.78rem", fontWeight: 500, padding: "3px 12px", borderRadius: "100px"
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                Opening Creator Workspace...
              </p>
            </div>
          </Panel>
        ) : (
          <form onSubmit={submitCreatorOnboarding}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "24px",
              padding: "36px",
              boxShadow: "var(--shadow-md)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Field 1: Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                    Full Name <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sharlmon Musundi"
                    style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 18px", color: "#ffffff" }}
                  />
                </div>

                {/* Field 2: Email */}
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                    Email Address <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. sharlmon@synthos.dev"
                    style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 18px", color: "#ffffff" }}
                  />
                </div>

                {/* Field 3: Primary Role */}
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                    Primary Capability / Role
                  </label>
                  <select
                    className="select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 18px", color: "#ffffff" }}
                  >
                    <option value="Full-Stack Developer">Full-Stack Web Developer</option>
                    <option value="Creative Director">Creative Director & Strategist</option>
                    <option value="UI/UX Designer">UI/UX & Product Designer</option>
                    <option value="Film & Motion Producer">Film & Motion Producer</option>
                    <option value="Agency Principal">Agency Principal / Founder</option>
                  </select>
                </div>

                {/* Field 4: Intro / Skills */}
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                    Tell us about your tech stack & build experience (or use Voice)
                  </label>
                  <VoiceInput
                    value={form.bio}
                    onChange={(v) => setForm({ ...form, bio: v })}
                    placeholder="e.g. I am a full-stack developer building React, Next.js, and Node.js web applications..."
                    rows={3}
                  />
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
                      Complete Creator Onboarding <ArrowRight size={18} />
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
