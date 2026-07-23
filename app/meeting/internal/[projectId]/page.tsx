"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, MicOff, CheckCircle2, ShieldCheck, ArrowRight, Server, FileText } from "lucide-react";

export default function InternalSyncMeetingPage({ params }: { params: { projectId: string } }) {
  const projectId = decodeURIComponent(params.projectId);
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [fetchingProject, setFetchingProject] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch project details on load
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
        const data = await res.json();
        if (res.ok && data.project) {
          setProject(data.project);
        }
      } catch (err) {
        console.warn("Failed to fetch project details:", err);
      } finally {
        setFetchingProject(false);
      }
    }
    loadProject();
  }, [projectId]);

  function toggleDictation() {
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
      setTranscript((prev) => (prev ? `${prev} ${text}` : text));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }

  async function submitInternalSync() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/agents/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          transcript,
          discoveryNotes: project?.discoveryNotes || "",
          title: "Final Technical Proposal & Scope",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate final proposal.");

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Internal production sync processing failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F5] px-6 py-8 text-zinc-950 md:px-14 md:py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-300 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Phase 2 / Internal Production Node
            </p>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Internal Architecture Sync
          </h1>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition"
        >
          ← Return to Mission Control
        </Link>
      </div>

      {/* Project Details Banner */}
      <div className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Client Record</p>
            <h2 className="text-xl font-bold text-zinc-900">
              {fetchingProject ? "Loading client details…" : project?.clientName || "Client Project"}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-3 py-1 font-mono text-zinc-800 border border-zinc-200">
              Project ID: <strong>{projectId}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-3 py-1 text-blue-800 border border-blue-200 font-semibold uppercase tracking-wider">
              Stage: {project?.stage || "internal_sync"}
            </span>
          </div>
        </div>

        {project?.discoveryNotes && (
          <div className="mt-4 text-xs text-zinc-600">
            <span className="font-semibold text-zinc-800">Discovery Baseline:</span>{" "}
            <span className="italic">{project.discoveryNotes.slice(0, 180)}…</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.8fr]">
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                <span>Production Sync Transcript</span>
              </label>

              <button
                type="button"
                onClick={toggleDictation}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isListening
                    ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                    : "bg-zinc-200/80 text-zinc-800 hover:bg-zinc-300"
                }`}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5 text-rose-600" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{isListening ? "Listening…" : "Dictate Live"}</span>
              </button>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              placeholder="Paste or dictate internal engineering decisions, technical scope, milestones, and invoice line items..."
              className="w-full border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-900 leading-relaxed outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>

          <button
            onClick={submitInternalSync}
            disabled={loading || !transcript.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {loading ? (
              <span>Synthesizing Final Proposal & Invoice…</span>
            ) : (
              <>
                <span>Synthesize Final Proposal & Invoice</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </section>

        {/* Status / Handoff Sidebar */}
        <aside className="space-y-6">
          <div className="border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Phase 2 Dual-Agent Pipeline
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              The Technical Agency Lead Agent synthesizes internal engineering decisions into a Final Proposal with HTML Milestone and Invoice tables. The Meta-Agent Auditor verifies confidence (&gt;90%) before routing to Mission Control as <strong className="text-zinc-900">ready_for_dispatch</strong>.
            </p>
          </div>

          {result && (
            <div className="border border-emerald-200 bg-emerald-50/90 p-6 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                <span>Final Proposal Synthesized</span>
              </div>

              <div className="mt-4 space-y-2 border-t border-emerald-200 pt-3 text-xs text-zinc-800">
                <p>
                  Confidence Score: <strong className="text-emerald-700">{result.proposal?.confidenceScore}%</strong> (Passed Meta-Audit)
                </p>
                <p>
                  Status: <strong className="text-zinc-900">ready_for_dispatch</strong>
                </p>
                {result.audit?.feedback && (
                  <p className="mt-2 rounded bg-white/70 p-2.5 font-mono text-[11px] text-zinc-700 border border-emerald-200">
                    {result.audit.feedback}
                  </p>
                )}
              </div>

              <button
                onClick={() => router.push("/admin")}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-800 transition"
              >
                <span>View Proposal in Mission Control →</span>
              </button>
            </div>
          )}

          {error && (
            <div className="border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              {error}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
