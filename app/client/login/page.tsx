"use client"

import { useState, useEffect } from "react"
import { useSignIn, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ClientLoginPage() {
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { setActive, user } = useClerk()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRegistered(window.location.search.includes("registered=1"))
    }
    if (user) {
      router.push("/client/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signInLoaded) throw new Error("Sign in not loaded")

      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/client/dashboard")
      } else {
        setError("Additional verification required")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", border: "1px solid var(--line)", padding: "36px 32px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>Log in to access your projects.</p>
        </div>

        {registered && (
          <div style={{ padding: "12px 16px", background: "var(--approved-soft)", border: "1px solid var(--approved)", color: "var(--approved)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            Account created. Please log in.
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Email <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-signal" disabled={loading || !signInLoaded} style={{ width: "100%" }}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: "0.88rem", color: "var(--ink-3)", textAlign: "center" }}>
          Don&apos;t have an account? <Link href="/client/signup" style={{ color: "var(--signal)" }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
