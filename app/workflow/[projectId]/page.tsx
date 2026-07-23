"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Mic,
  MicOff,
  Calendar,
  Video,
  Send,
  Edit2,
  Check,
  ShieldCheck,
  ArrowRight,
  Server,
  Sparkles,
} from "lucide-react";

type StageName = "discover" | "understand" | "create" | "review" | "deliver";

const STAGES: { id: StageName; title: string; subtitle: string; stepNumber: number }[] = [
  { id: "discover", title: "01. Discover", subtitle: "Input client meeting transcript", stepNumber: 0 },
  { id: "understand", title: "02. Understand", subtitle: "Synthesize Contact Report & Calendar auto-sync", stepNumber: 1 },
  { id: "create", title: "03. Create", subtitle: "Input internal sync & synthesize Proposal", stepNumber: 2 },
  { id: "review", title: "04. Review", subtitle: "Dual-Agent audit & Human refine", stepNumber: 3 },
  { id: "deliver", title: "05. Deliver", subtitle: "Dispatch finalized proposal package", stepNumber: 4 },
];

export default function ContinuousWorkflowPage({ params }: { params: { projectId: string } }) {
  const projectId = decodeURIComponent(params.projectId);

  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<StageName>("discover");
  const [loadingProject, setLoadingProject] = useState(true);

  // Form states
  const [discoveryNotes, setDiscoveryNotes] = useState("");
  const [discoveryTranscript, setDiscoveryTranscript] = useState("");
  const [internalTranscript, setInternalTranscript] = useState("");

  // Process states
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactReportResult, setContactReportResult] = useState<any>(null);
  const [finalProposalResult, setFinalProposalResult] = useState<any>(null);
  const [dispatching, setDispatching] = useState(false);

  // Human-in-the-Loop Live Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch Project details and existing proposals
  useEffect(() => {
    async function fetchProjectData() {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
        const data = await res.json();
        if (res.ok && data.project) {
          setProject(data.project);
          setProposals(data.project.proposals || []);
          if (data.project.discoveryNotes) setDiscoveryNotes(data.project.discoveryNotes);
          if (data.project.fathomNotes) setInternalTranscript(data.project.fathomNotes);

          // Map project stage to active tab
          const stageMap: Record<string, StageName> = {
            discovery: "discover",
            internal_sync: "create",
            ready_for_dispatch: "review",
            delivered: "deliver",
          };
          if (stageMap[data.project.stage]) {
            setActiveTab(stageMap[data.project.stage]);
          }
        }
      } catch (err) {
        console.warn("Failed to load project workflow data:", err);
      } finally {
        setLoadingProject(false);
      }
    }
    fetchProjectData();
  }, [projectId]);

  // Voice dictation toggle
  function toggleDictation(targetSetter: (fn: (prev: string) => string) => void) {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Speech Recognition is not supported on this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const text = event.results[event.resultIndex][0].transcript;
      targetSetter((prev) => (prev ? `${prev} ${text}` : text));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }

  // Phase 1: Submit Discovery -> Synthesize Contact Report & Auto-Schedule Calendar
  async function runPhase1Discovery() {
    setIsProcessing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/agents/contact-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project?.id || projectId,
          transcript: discoveryTranscript,
          discoveryNotes,
          title: "Executive Contact Report",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate Contact Report.");

      setContactReportResult(data);
      if (data.proposal) {
        setProposals((prev) => [data.proposal, ...prev]);
      }
      setNotice({
        message: "Contact Report synthesized & Internal Sync scheduled on Google Calendar!",
        type: "success",
      });
      setActiveTab("understand");
    } catch (err: any) {
      setNotice({ message: err?.message || "Phase 1 processing failed.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  }

  // Phase 2: Submit Internal Sync -> Synthesize Final Technical Proposal & Invoice
  async function runPhase2InternalSync() {
    setIsProcessing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/agents/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project?.id || projectId,
          transcript: internalTranscript,
          discoveryNotes,
          title: "Final Technical Proposal & Scope",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate Final Proposal.");

      setFinalProposalResult(data);
      if (data.proposal) {
        setProposals((prev) => [data.proposal, ...prev]);
        setEditedContent(data.proposal.content || "");
      }
      setNotice({
        message: "Final Technical Proposal & Invoice synthesized! Passed Meta-Audit (>90%).",
        type: "success",
      });
      setActiveTab("review");
    } catch (err: any) {
      setNotice({ message: err?.message || "Phase 2 processing failed.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  }

  // Human-in-the-Loop: Save live proposal edits
  async function handleSaveEdit(proposalId: string) {
    setSavingEdit(true);
    try {
      const res = await fetch("/api/proposals/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, content: editedContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save edits.");

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, content: editedContent } : p))
      );
      setIsEditing(false);
      setNotice({ message: "Proposal markup updated successfully.", type: "success" });
    } catch (err: any) {
      setNotice({ message: err?.message || "Save edit failed.", type: "error" });
    } finally {
      setSavingEdit(false);
    }
  }

  // Phase 3: Dispatch final proposal email via Resend
  async function dispatchEmail(proposalId: string) {
    setDispatching(true);
    setNotice(null);
    try {
      const res = await fetch("/api/proposals/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dispatch failed.");

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: "dispatched" } : p))
      );
      if (project) setProject({ ...project, stage: "delivered" });
      setNotice({ message: "Proposal successfully dispatched to client email via Resend!", type: "success" });
      setActiveTab("deliver");
    } catch (err: any) {
      setNotice({ message: err?.message || "Email dispatch failed.", type: "error" });
    } finally {
      setDispatching(false);
    }
  }

  const latestProposal = proposals[0] || null;
  const isDelivered = project?.stage === "delivered" || latestProposal?.status === "dispatched";

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-8 text-zinc-950 md:px-14 md:py-12 font-sans">
      {/* Top Header */}
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Jitume Agency OS · Master Workflow Hub
            </p>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {loadingProject ? "Loading Workflow…" : project?.clientName || "Continuous Production Pipeline"}
          </h1>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition border border-zinc-300 rounded px-4 py-2 bg-white"
        >
          ← Mission Control Dashboard
        </Link>
      </header>

      {/* Global Status Notice */}
      {notice && (
        <div
          className={`mt-6 flex items-center justify-between border p-4 text-sm font-medium transition-all ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            className="text-xs uppercase tracking-wider underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 5-Stage Visual Horizontal Progress Stepper */}
      <nav className="mt-8 border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {STAGES.map((s, idx) => {
            const isActive = activeTab === s.id;
            const currentStepIdx = isDelivered
              ? 4
              : activeTab === "deliver"
              ? 4
              : activeTab === "review"
              ? 3
              : activeTab === "create"
              ? 2
              : activeTab === "understand"
              ? 1
              : 0;

            const isDone = idx < currentStepIdx;

            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`flex flex-col gap-1 p-3 text-left transition border ${
                  isActive
                    ? "border-blue-600 bg-blue-50/50 text-blue-900"
                    : isDone
                    ? "border-emerald-200 bg-emerald-50/30 text-emerald-950 hover:bg-emerald-50"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {s.title}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-600 stroke-white" />
                  ) : isActive ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                    </span>
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-zinc-300" />
                  )}
                </div>
                <p className="text-[11px] leading-tight text-zinc-600">{s.subtitle}</p>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Continuous Stage View */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
        
        {/* Stage Content Panel */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          
          {/* TAB 1: DISCOVER */}
          {activeTab === "discover" && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Stage 01</span>
                <h2 className="text-2xl font-serif font-bold text-zinc-950">Client Discovery Capture</h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Record live discovery call signal or paste client requirements to start the synthesis chain.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">Discovery Notes</label>
                </div>
                <textarea
                  value={discoveryNotes}
                  onChange={(e) => setDiscoveryNotes(e.target.value)}
                  rows={4}
                  placeholder="Key project objectives, architectural needs, target audience, and business goals..."
                  className="w-full border border-zinc-300 p-3 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">Live Call Transcript</label>
                  <button
                    type="button"
                    onClick={() => toggleDictation(setDiscoveryTranscript)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isListening ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {isListening ? <MicOff className="h-3.5 w-3.5 text-rose-600" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{isListening ? "Listening…" : "Dictate Live"}</span>
                  </button>
                </div>
                <textarea
                  value={discoveryTranscript}
                  onChange={(e) => setDiscoveryTranscript(e.target.value)}
                  rows={6}
                  placeholder="Paste or dictate live client conversation transcript signal..."
                  className="w-full border border-zinc-300 p-3 font-mono text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={runPhase1Discovery}
                disabled={isProcessing || (!discoveryNotes.trim() && !discoveryTranscript.trim())}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-300"
              >
                {isProcessing ? "Synthesizing Contact Report & Scheduling…" : "Run Phase 1 Discovery & Schedule Sync →"}
              </button>
            </div>
          )}

          {/* TAB 2: UNDERSTAND */}
          {activeTab === "understand" && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Stage 02</span>
                <h2 className="text-2xl font-serif font-bold text-zinc-950">AI Synthesis & Calendar Auto-Schedule</h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Synthesized Contact Report for client alignment & auto-booked Google Calendar internal production meeting.
                </p>
              </div>

              {contactReportResult?.scheduleInfo && (
                <div className="border border-blue-200 bg-blue-50/70 p-5 rounded">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Google Calendar Event Auto-Scheduled</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-zinc-700">
                    <p><strong>Scheduled Time:</strong> {contactReportResult.scheduleInfo.eventTime}</p>
                    <p className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5 text-blue-600" />
                      <strong>Google Meet:</strong>{" "}
                      <a href={contactReportResult.scheduleInfo.meetLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {contactReportResult.scheduleInfo.meetLink}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {contactReportResult?.proposal?.content ? (
                <div className="border border-zinc-200 bg-white p-5 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Synthesized Contact Report HTML</h3>
                  <div
                    className="prose prose-zinc max-w-none text-xs leading-relaxed bg-zinc-50 p-4 border border-zinc-200"
                    dangerouslySetInnerHTML={{ __html: contactReportResult.proposal.content }}
                  />
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Run Phase 1 in Stage 01 to view synthesized Contact Report.</p>
              )}

              <button
                onClick={() => setActiveTab("create")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <span>Proceed to Stage 03: Production Sync →</span>
              </button>
            </div>
          )}

          {/* TAB 3: CREATE */}
          {activeTab === "create" && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Stage 03</span>
                <h2 className="text-2xl font-serif font-bold text-zinc-950">Internal Production Engineering Sync</h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Enter internal production decisions, line items, and engineering scope for final proposal synthesis.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-blue-600" />
                    <span>Production Sync Transcript / Scope</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDictation(setInternalTranscript)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isListening ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {isListening ? <MicOff className="h-3.5 w-3.5 text-rose-600" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{isListening ? "Listening…" : "Dictate Live"}</span>
                  </button>
                </div>
                <textarea
                  value={internalTranscript}
                  onChange={(e) => setInternalTranscript(e.target.value)}
                  rows={8}
                  placeholder="Paste or dictate internal engineering alignment, backend architecture, milestone phases, and invoice pricing..."
                  className="w-full border border-zinc-300 p-3 font-mono text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={runPhase2InternalSync}
                disabled={isProcessing || !internalTranscript.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-300"
              >
                {isProcessing ? "Synthesizing Proposal & Invoice via Dual-Agent Loop…" : "Synthesize Final Proposal & Invoice →"}
              </button>
            </div>
          )}

          {/* TAB 4: REVIEW */}
          {activeTab === "review" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Stage 04</span>
                  <h2 className="text-2xl font-serif font-bold text-zinc-950">Dual-Agent Review & Human Refine</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                  <span>{isEditing ? "Exit Editor" : "Refine HTML"}</span>
                </button>
              </div>

              {latestProposal ? (
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-600 bg-white p-4 border border-zinc-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900">Meta-Agent Audit Score: </span>
                      <strong className="text-blue-700">{latestProposal.confidenceScore}%</strong> (Passed Auditor Gate)
                    </div>
                    <span className="rounded bg-blue-100 px-2.5 py-0.5 font-bold uppercase text-[10px] text-blue-800">
                      {latestProposal.status}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500">Edit proposal HTML markup directly below:</p>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={12}
                        className="w-full border border-zinc-300 p-4 font-mono text-xs text-zinc-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      <button
                        onClick={() => handleSaveEdit(latestProposal.id)}
                        disabled={savingEdit}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>{savingEdit ? "Saving…" : "Save changes"}</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="prose prose-zinc max-w-none text-xs leading-relaxed bg-white p-6 border border-zinc-200"
                      dangerouslySetInnerHTML={{ __html: latestProposal.content }}
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No proposal synthesized yet. Complete Stage 03 first.</p>
              )}

              {latestProposal && (
                <button
                  onClick={() => dispatchEmail(latestProposal.id)}
                  disabled={dispatching || latestProposal.status === "dispatched"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-zinc-300"
                >
                  <Send className="h-4 w-4" />
                  <span>{dispatching ? "Dispatching via Resend…" : latestProposal.status === "dispatched" ? "Dispatched to Client" : "Approve & Dispatch Proposal to Client →"}</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 5: DELIVER */}
          {activeTab === "deliver" && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Stage 05</span>
                <h2 className="text-2xl font-serif font-bold text-zinc-950">Automated Client Handoff</h2>
              </div>

              <div className="border border-emerald-200 bg-emerald-50 p-6 rounded space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                  <span>✓ PROJECT COMPLETED & DELIVERED</span>
                </div>
                <p className="text-xs text-zinc-700">
                  The client proposal and invoice have been dispatched to <strong>{project?.clientEmail || "client email"}</strong> via verified Resend domain (<code className="text-zinc-900">Sharlmon &lt;hello@sharl-tech.co.ke&gt;</code>).
                </p>
              </div>

              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <span>Return to Mission Control Overview →</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar: Dynamic Audit Log & Quick Info */}
        <aside className="space-y-6">
          <div className="border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Agentic Pipeline Audit
              </h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every stage executes bounded Dual-Agent verification (Execution Agent + Meta-Agent Auditor) with strict &gt;90% confidence gates.
            </p>

            {latestProposal?.metaAuditNotes && (
              <div className="border-l-2 border-zinc-900 bg-zinc-100 p-3.5 text-xs text-zinc-700 font-mono">
                <p className="font-bold text-zinc-900 mb-1 font-sans">Meta-Audit Log:</p>
                {latestProposal.metaAuditNotes}
              </div>
            )}
          </div>
        </aside>

      </div>
    </main>
  );
}
