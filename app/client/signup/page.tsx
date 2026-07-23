"use client"

import { useState } from "react"
import { useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ClientSignupPage() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signUpLoaded) throw new Error("Sign up not loaded")

      const result = await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      const res = await fetch("/api/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, clerkId: result.createdUserId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create client account")
      }

      router.push("/client/login?registered=1")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", border: "1px solid var(--line)", padding: "36px 32px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>Client Access</h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>Create an account to view your projects.</p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Full Name <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Company</label>
            <input className="admin-input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="field">
            <label>Password <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" className="btn btn-signal" disabled={loading || !signUpLoaded} style={{ width: "100%" }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: "0.88rem", color: "var(--ink-3)", textAlign: "center" }}>
          Already have an account? <Link href="/client/login" style={{ color: "var(--signal)" }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
