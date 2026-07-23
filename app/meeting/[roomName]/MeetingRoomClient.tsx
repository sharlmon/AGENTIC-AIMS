"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, FileText, Calendar, MessageSquare, Upload, X, Link } from "lucide-react"
import { VoiceInput } from "@/components/app/VoiceInput"

type Message = {
  id: string
  senderName?: string
  senderRole?: string
  body: string
  kind?: string
  createdAt: string
}

type Artifact = {
  name: string
  url: string
  mimeType: string
  size: number
  uploadedAt: string
}

const MEETING_SOURCES = [
  { value: "embedded", label: "Embedded Room" },
  { value: "zoom", label: "Zoom" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "in-person", label: "In Person" },
  { value: "phone", label: "Phone Call" },
  { value: "custom", label: "Custom / Other" },
]

export default function MeetingRoomClient({ roomName, project }: { roomName: string; project: any }) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [meetingSource, setMeetingSource] = useState(project?.call?.meetingSource || "embedded")
  const [artifacts, setArtifacts] = useState<Artifact[]>(project?.call?.artifacts || [])
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const [activeTab, setActiveTab] = useState("notes")

  useEffect(() => {
    const interval = setInterval(() => {
      if (notesRef.current) {
        notesRef.current.focus()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const uploadArtifact = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "meeting-artifacts")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      const artifact: Artifact = { name: file.name, url: data.url, mimeType: file.type, size: file.size, uploadedAt: new Date().toISOString() }
      setArtifacts(prev => [...prev, artifact])
      await saveArtifacts([...artifacts, artifact])
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const saveArtifacts = async (newArtifacts: Artifact[]) => {
    const projectId = roomName.split("-")[1]
    await fetch(`/api/projects/${projectId}/meeting/artifacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artifacts: newArtifacts, meetingSource, transcript: notes }),
    })
  }

  const removeArtifact = async (index: number) => {
    const newArtifacts = artifacts.filter((_, i) => i !== index)
    setArtifacts(newArtifacts)
    await saveArtifacts(newArtifacts)
  }

  const endMeeting = async () => {
    if (!confirm("End meeting and generate contact report, proposal, and schedule?")) return
    setEnding(true)
    try {
      const projectId = roomName.split("-")[1]
      await saveArtifacts(artifacts)
      const res = await fetch(`/api/meetings/${roomName}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, notes, transcript: notes, meetingSource }),
      })
      const data = await res.json()
      if (data.conversation || data.contactReport) {
        router.push(`/dashboard/projects/${projectId}`)
      }
    } catch (e) {
      alert("Failed to end meeting")
      setEnding(false)
    }
  }

  const brief = project?.brief
  const hasContext = brief && (brief.businessObjective || brief.audience || brief.direction || brief.deliverables?.length)
  const hasInput = notes.trim() || artifacts.length > 0

  return (
    <div className="meeting-layout">
      <div className="meeting-video">
        <iframe
          src={`https://synthos.daily.co/${roomName}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Meeting room"
        />
      </div>

      <div className="meeting-sidebar">
        <div className="meeting-sidebar-head">
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>AI Assistant</h3>
          <span className="chip" style={{ fontSize: "0.72rem" }}>Recording</span>
        </div>

        {hasContext && (
          <div style={{ padding: "12px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
            <p style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 6 }}>Project Context</p>
            <p style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 500, marginBottom: 2 }}>{project.name}</p>
            <p className="tiny muted" style={{ marginBottom: 6 }}>{brief.clientName} · {brief.company}</p>
            {brief.businessObjective && (
              <p style={{ fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.4, marginBottom: 4 }}>
                <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>Objective:</span> {brief.businessObjective}
              </p>
            )}
            {brief.audience && (
              <p style={{ fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.4 }}>
                <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>Audience:</span> {brief.audience}
              </p>
            )}
          </div>
        )}

        <div className="meeting-tabs">
          <button className={`meeting-tab ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
            <Mic size={14} /> Notes
          </button>
          <button className={`meeting-tab ${activeTab === "context" ? "active" : ""}`} onClick={() => setActiveTab("context")}>
            <FileText size={14} /> Full Brief
          </button>
          <button className={`meeting-tab ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>
            <Calendar size={14} /> Schedule
          </button>
          <button className={`meeting-tab ${activeTab === "messages" ? "active" : ""}`} onClick={() => setActiveTab("messages")}>
            <MessageSquare size={14} /> Messages
          </button>
        </div>

        <div className="meeting-panel">
          {activeTab === "notes" && (
            <>
              <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 8, display: "block" }}>
                {meetingSource === "embedded" ? "Live Meeting Notes" : "Meeting Notes / Transcript"}
              </label>
              <VoiceInput
                ref={notesRef}
                value={notes}
                onChange={(v) => setNotes(v)}
                placeholder={meetingSource === "embedded" ? "AI is listening... Type or paste meeting notes here." : "Paste your transcript or notes here. The AI will generate a contact report, proposal, and schedule when you end the meeting."}
                className="textarea meeting-notes"
                style={{ flex: 1, minHeight: 160 }}
                rows={6}
              />

              {meetingSource !== "embedded" && (
                <div style={{ marginTop: 12, padding: 12, background: "var(--surface-2)", border: "1px dashed var(--line)", borderRadius: 8 }}>
                  <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 8, display: "block" }}>
                    <Upload size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                    Upload Transcript / Document
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                    onChange={(e) => e.target.files?.[0] && uploadArtifact(e.target.files[0])}
                    disabled={uploading}
                    style={{ fontSize: "0.82rem", color: "var(--ink-2)" }}
                  />
                  {uploading && <p className="tiny muted" style={{ marginTop: 4 }}>Uploading...</p>}

                  {artifacts.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {artifacts.map((artifact, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fff", border: "1px solid var(--line)", borderRadius: 6 }}>
                          <FileText size={14} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artifact.name}</p>
                            <p className="tiny muted" style={{ margin: 0 }}>{new Date(artifact.uploadedAt).toLocaleTimeString()}</p>
                          </div>
                          <a href={artifact.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent)" }}>Open</a>
                          <button onClick={() => removeArtifact(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ink-3)" }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "context" && brief && (
            <div className="stack gap-3" style={{ padding: "4px 0" }}>
              <div>
                <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Project</label>
                <p style={{ fontSize: "0.92rem", color: "var(--ink)", fontWeight: 500 }}>{project.name}</p>
                <p className="tiny muted">{brief.clientName} · {brief.company}</p>
              </div>
              <div>
                <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Business Objective</label>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{brief.businessObjective || "—"}</p>
              </div>
              <div>
                <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Target Audience</label>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{brief.audience || "—"}</p>
              </div>
              {(brief.direction || brief.deliverables?.length) && (
                <div>
                  <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Creative Direction</label>
                  <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{brief.direction || "—"}</p>
                  {brief.deliverables?.length > 0 && (
                    <ul className="stack gap-1" style={{ marginTop: 6, paddingLeft: 16 }}>
                      {brief.deliverables.map((d: string, i: number) => (
                        <li key={i} style={{ fontSize: "0.82rem", color: "var(--ink-2)" }}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {(brief.budget || brief.timeline) && (
                <div className="form-grid-2">
                  {brief.budget && (
                    <div>
                      <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Budget</label>
                      <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{brief.budget}</p>
                    </div>
                  )}
                  {brief.timeline && (
                    <div>
                      <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Timeline</label>
                      <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{brief.timeline}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "schedule" && project?.call && (
            <div className="stack gap-2" style={{ padding: "4px 0" }}>
              <div>
                <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Date</label>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{project.call.date}</p>
              </div>
              <div>
                <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Duration</label>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{project.call.duration}</p>
              </div>
              <div>
                <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>Participants</label>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{(project.call.participants || []).join(", ")}</p>
              </div>
              {project.call.roomUrl && (
                <div style={{ marginTop: 8 }}>
                  <a href={project.call.roomUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
                    Open Meeting Room
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="stack gap-2" style={{ padding: "4px 0" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>Messages and reports will appear here after the meeting ends.</p>
            </div>
          )}

          {activeTab === "context" && !brief && (
            <div className="stack gap-2" style={{ padding: "4px 0" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>No brief context available for this project.</p>
            </div>
          )}
        </div>

        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="tiny" style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 2, display: "block" }}>
            Meeting Source
          </label>
          <select
            className="select"
            value={meetingSource}
            onChange={(e) => setMeetingSource(e.target.value)}
            style={{ fontSize: "0.88rem" }}
          >
            {MEETING_SOURCES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="meeting-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => { setNotes(""); setArtifacts([]); }}>
            Clear
          </button>
          <button className="btn btn-signal btn-sm" onClick={endMeeting} disabled={ending || !hasInput}>
            <Square size={14} /> {ending ? "Processing..." : "End Meeting & Generate"}
          </button>
        </div>
      </div>
    </div>
  )
}
