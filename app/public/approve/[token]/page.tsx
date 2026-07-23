"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

type ApprovalData = {
  type: "proposal" | "quote"
  data: any
}

export default function PublicApprovePage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<ApprovalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectSuggestions, setRejectSuggestions] = useState({
    budget: "",
    timeline: "",
    scope: "",
  })

  useEffect(() => {
    fetch(`/api/public/approve/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setData)
      .catch(() => setError("This approval link is invalid or has expired."))
      .finally(() => setLoading(false))
  }, [token])

  const handleAction = async (action: "approve" | "reject", extra?: { feedback?: string; suggestions?: { budget?: string; timeline?: string; scope?: string } }) => {
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const body: any = { action }
      if (extra) {
        body.feedback = extra.feedback
        body.suggestions = extra.suggestions
      }

      const res = await fetch(`/api/public/approve/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to process action" }))
        throw new Error(err.error || "Failed to process action")
      }

      const result = (await res.json()) as ApprovalData
      setData(result)
      setMessage(action === "approve" ? "Approved successfully." : "Your feedback has been sent. The team will be in touch.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          color: "var(--ink-3)",
          fontSize: "0.82rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Loading…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          color: "var(--rejected)",
          fontSize: "0.82rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {error || "Not found"}
      </div>
    )
  }

  const item = data.data

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "var(--font-sans)",
        color: "var(--ink-2)",
        lineHeight: 1.6,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--signal)",
              marginBottom: 12,
            }}
          >
            {data.type === "proposal" ? "Proposal" : "Quote"} Approval
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              color: "var(--ink)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            {data.type === "proposal" ? "Review & Approve Proposal" : "Review & Approve Quote"}
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--ink-3)", lineHeight: 1.65 }}>
            Please review the details below and let us know your decision.
          </p>
        </div>

        <div style={{ border: "1px solid var(--line)", marginBottom: 32 }}>
          {data.type === "proposal" && (
            <div style={{ padding: "28px 32px" }}>
              {item.overview && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Overview
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.overview}</p>
                </div>
              )}
              {item.problem && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Problem
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.problem}</p>
                </div>
              )}
              {item.solution && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Solution
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.solution}</p>
                </div>
              )}
              {item.scope && Array.isArray(item.scope) && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Scope
                  </div>
                  <ul style={{ paddingLeft: 20, fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                    {item.scope.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.deliverables && Array.isArray(item.deliverables) && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Deliverables
                  </div>
                  <ul style={{ paddingLeft: 20, fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                    {item.deliverables.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.timeline && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Timeline
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.timeline}</p>
                </div>
              )}
              {item.investment && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Investment
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.investment}</p>
                </div>
              )}
              {item.team && Array.isArray(item.team) && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Team
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
                    {item.team.join(", ")}
                  </p>
                </div>
              )}
              {item.terms && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Terms
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.terms}</p>
                </div>
              )}
            </div>
          )}

          {data.type === "quote" && (
            <div style={{ padding: "28px 32px" }}>
              {item.services && Array.isArray(item.services) && item.services.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 12,
                    }}
                  >
                    Services
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.88rem",
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--line-strong)" }}>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "10px 12px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--ink-3)",
                              fontWeight: 500,
                            }}
                          >
                            Service
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "10px 12px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--ink-3)",
                              fontWeight: 500,
                            }}
                          >
                            Qty
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "10px 12px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--ink-3)",
                              fontWeight: 500,
                            }}
                          >
                            Rate
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "10px 12px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--ink-3)",
                              fontWeight: 500,
                            }}
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.services.map((s: any, i: number) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                            <td style={{ padding: "12px 12px", color: "var(--ink)" }}>{s.name}</td>
                            <td style={{ padding: "12px 12px", color: "var(--ink-2)" }}>{s.qty}</td>
                            <td style={{ padding: "12px 12px", textAlign: "right", color: "var(--ink-2)" }}>
                              ${s.rate.toLocaleString()}
                            </td>
                            <td
                              style={{
                                padding: "12px 12px",
                                textAlign: "right",
                                color: "var(--ink)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              ${(s.qty * s.rate).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {item.paymentTerms && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    Payment Terms
                  </div>
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.7 }}>{item.paymentTerms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {message && (
          <div
            style={{
              padding: "16px 20px",
              background: "var(--approved-soft)",
              border: "1px solid var(--approved)",
              color: "var(--approved)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 24,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "16px 20px",
              background: "var(--rejected-soft)",
              border: "1px solid var(--rejected)",
              color: "var(--rejected)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {item.status !== "approved" && item.status !== "rejected" && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => handleAction("approve")}
              disabled={submitting}
              style={{
                padding: "14px 28px",
                background: submitting ? "var(--ink-3)" : "var(--approved)",
                color: "#fff",
                border: "2px solid var(--approved)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
                transition: "all 0.2s ease",
              }}
            >
              Approve
            </button>

            {!showRejectForm ? (
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={submitting}
                style={{
                  padding: "14px 28px",
                  background: "transparent",
                  color: "var(--signal)",
                  border: "2px solid var(--signal)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Request Changes
              </button>
            ) : (
              <div style={{ width: "100%", marginTop: 12, padding: 20, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Request Changes</h3>
                <div className="stack gap-3">
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>What would you like us to change?</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. The timeline is too aggressive, the scope needs to include social media assets..."
                      style={{
                        width: "100%",
                        minHeight: 120,
                        padding: 12,
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-sans)",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        background: "var(--bg)",
                        color: "var(--ink)",
                      }}
                    />
                  </div>

                  {data?.type === "quote" && (
                    <div className="form-grid-2">
                      <div>
                        <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Budget adjustments</label>
                        <input
                          className="input"
                          value={rejectSuggestions.budget}
                          onChange={(e) => setRejectSuggestions({ ...rejectSuggestions, budget: e.target.value })}
                          placeholder="e.g. Please reduce by 15%"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink-2)", marginBottom: 6, display: "block" }}>Timeline adjustments</label>
                        <input
                          className="input"
                          value={rejectSuggestions.timeline}
                          onChange={(e) => setRejectSuggestions({ ...rejectSuggestions, timeline: e.target.value })}
                          placeholder="e.g. Need 4 weeks instead of 2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="row gap-2">
                    <button
                      onClick={() => handleAction("reject", { feedback: rejectReason, suggestions: data?.type === "quote" ? rejectSuggestions : undefined })}
                      disabled={submitting || !rejectReason.trim()}
                      style={{
                        padding: "10px 20px",
                        background: submitting || !rejectReason.trim() ? "var(--ink-3)" : "var(--rejected)",
                        color: "#fff",
                        border: "2px solid var(--rejected)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        cursor: submitting || !rejectReason.trim() ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {submitting ? "Sending…" : "Send Feedback"}
                    </button>
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectReason(""); setRejectSuggestions({ budget: "", timeline: "", scope: "" }) }}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {item.status === "approved" && (
          <div style={{ padding: "20px 24px", background: "var(--approved-soft)", border: "1px solid var(--approved)" }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                color: "var(--approved)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              Approved
            </p>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", marginTop: 6 }}>
              Thank you for your approval. We will proceed with the next steps.
            </p>
          </div>
        )}

        {item.status === "rejected" && (
          <div style={{ padding: "20px 24px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)" }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                color: "var(--rejected)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              Rejected
            </p>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", marginTop: 6 }}>
              Thank you for your feedback. We will be in touch to discuss revisions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
