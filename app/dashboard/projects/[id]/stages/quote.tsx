"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/types"
import { Panel, PanelHeader, StatusPill, Empty } from "@/components/app/ui"

export function QuoteStage({ project }: { project: Project }) {
  const q = project.quote
  const [editing, setEditing] = useState(false)
  const [services, setServices] = useState((q?.services || [{ name: "", desc: "", qty: 1, rate: 0 }]).map((s: any) => ({ ...s })))
  const [discount, setDiscount] = useState(q?.discount || 0)
  const [tax, setTax] = useState(q?.tax || 0)
  const [terms, setTerms] = useState(q?.paymentTerms || "")
  const [loading, setLoading] = useState(false)

  const subtotal = services.reduce((a, s) => a + (s.qty || 0) * (s.rate || 0), 0)
  const discountAmt = subtotal * (discount / 100)
  const taxed = (subtotal - discountAmt) * (tax / 100)
  const total = subtotal - discountAmt + taxed

  const addLine = () => setServices([...services, { name: "", desc: "", qty: 1, rate: 0 }])
  const updateLine = (i: number, field: string, val: any) => {
    const next = [...services]
    next[i] = { ...next[i], [field]: val }
    setServices(next)
  }
  const removeLine = (i: number) => setServices(services.filter((_, idx) => idx !== i))

  const save = async () => {
    setLoading(true)
    try {
      const payload = { services, discount, tax, paymentTerms: terms, status: q?.status || "review" }
      await fetch(`/api/projects/${project.id}/quote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      setEditing(false)
      window.location.reload()
    } catch (e) {
      console.error("Failed to save quote:", e)
    } finally {
      setLoading(false)
    }
  }

  if (!q) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 9" title="Quote" desc="The system will generate and send the quote automatically." />
        <div style={{ padding: 24 }}><Empty title="No quote yet" hint="The quote will be generated automatically by the AI workflow." /></div>
      </Panel>
    )
  }

  if (editing) {
    return (
      <Panel>
        <PanelHeader eyebrow="Stage 9" title="Edit Quote" />
        <div style={{ padding: 24 }} className="stack gap-3">
          {services.map((s, i) => (
            <div key={i} className="panel-soft" style={{ padding: 14 }}>
              <div className="form-grid-2">
                <div className="field"><label>Service</label><input className="input" value={s.name} onChange={(e) => updateLine(i, "name", e.target.value)} /></div>
                <div className="field"><label>Description</label><input className="input" value={s.desc} onChange={(e) => updateLine(i, "desc", e.target.value)} /></div>
                <div className="field"><label>Qty</label><input className="input" type="number" value={s.qty} onChange={(e) => updateLine(i, "qty", Number(e.target.value))} /></div>
                <div className="field"><label>Rate ($)</label><input className="input" type="number" value={s.rate} onChange={(e) => updateLine(i, "rate", Number(e.target.value))} /></div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => removeLine(i)}>Remove</button>
            </div>
          ))}
          <button className="btn btn-subtle btn-sm" onClick={addLine}>+ Add line</button>
          <div className="form-grid-3">
            <div className="field"><label>Discount (%)</label><input className="input" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></div>
            <div className="field"><label>Tax (%)</label><input className="input" type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} /></div>
            <div className="field"><label>Payment terms</label><input className="input" value={terms} onChange={(e) => setTerms(e.target.value)} /></div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-signal btn-sm" onClick={save} disabled={loading}>Save changes</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader eyebrow="Stage 9" title="Quote" desc="AI-generated quote. Sent to client for review." actions={
        <div className="row gap-2">
          <StatusPill status={q.status} />
          <span className="chip" style={{ fontSize: "0.72rem" }}>{(q as any).sentToClient ? "Sent to client" : "Draft"}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
        </div>
      } />
      <div style={{ padding: 24 }}>
        <div className="table-wrap">
          <table className="responsive-table quote-table">
            <thead><tr><th>Service</th><th>Description</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
            <tbody>
              {(q.services || []).length === 0 && <tr><td colSpan={5} className="tiny muted" style={{ textAlign: "center", padding: 20 }}>No line items yet.</td></tr>}
              {(q.services || []).map((s: any, i: number) => (
                <tr key={i}><td data-label="Service" style={{ fontWeight: 600, color: "var(--ink)" }}>{s.name}</td><td data-label="Description" className="tiny muted">{s.desc}</td><td data-label="Qty" className="num mono">{s.qty}</td><td data-label="Rate" className="num mono">${s.rate.toLocaleString()}</td><td data-label="Amount" className="num mono">${(s.qty * s.rate).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="quote-summary">
          <div className="stack gap-2">
            <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
            {discount > 0 && <Row label={`Discount (${discount}%)`} value={`−$${discountAmt.toLocaleString()}`} tone="signal" />}
            {tax > 0 && <Row label={`Tax (${tax}%)`} value={`$${taxed.toLocaleString()}`} />}
            <div className="hr" style={{ margin: "6px 0" }} />
            <Row label="Total" value={`$${total.toLocaleString()}`} strong />
            <Row label="Payment terms" value={q.paymentTerms || "—"} />
          </div>
        </div>
      </div>
    </Panel>
  )
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "signal" }) {
  return (
    <div className="row between">
      <span className="tiny" style={{ color: tone ? "var(--signal-ink)" : "var(--ink-3)", fontWeight: strong ? 600 : 400 }}>{label}</span>
      <span className="mono" style={{ fontWeight: strong ? 700 : 500, color: strong ? "var(--ink)" : "var(--ink-2)", fontSize: strong ? "1.05rem" : "0.9rem" }}>{value}</span>
    </div>
  )
}
