"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  MicOff,
  Video,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers,
} from "lucide-react";

export default function InternalWorkshopPage({ params }: { params: { id: string } }) {
  const projectId = decodeURIComponent(params.id);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [internalTranscript, setInternalTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [synthesizedProposal, setSynthesizedProposal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
        const data = await res.json();
        if (res.ok && data.project) {
          setProject(data.project);
          if (data.project.internalTranscript) setInternalTranscript(data.project.internalTranscript);
          if (data.project.finalRefinedProposal) setSynthesizedProposal(data.project.finalRefinedProposal);
        }
      } catch (err) {
        console.warn("Failed to load project workshop data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
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
      setInternalTranscript((prev) => (prev ? `${prev} ${text}` : text));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }

  async function handleSynthesize() {
    setIsSynthesizing(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalTranscript }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Synthesis failed.");

      setSynthesizedProposal(data.finalRefinedProposal);
      setNotice({
        message: "Stage 2 Internal Synthesis complete! Proposal saved to Mission Control review queue.",
        type: "success",
      });
    } catch (err: any) {
      setNotice({ message: err?.message || "Internal Synthesis failed.", type: "error" });
    } finally {
      setIsSynthesizing(false);
    }
  }

  const contactReportContent =
    project?.contactReport ||
    project?.proposals?.find((p: any) => p.type === "CONTACT_REPORT")?.content ||
    project?.discoveryNotes ||
    `<section className="prose prose-invert">
      <h3 className="text-zinc-100">Stage 1 Discovery Baseline</h3>
      <p className="text-zinc-400">Client discovery notes synthesized during Stage 1 discovery call.</p>
    </section>`;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-10 space-y-8">
      {/* Top Header Banner */}
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
              Stage 2 · Internal Production Engine
            </p>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            {loading ? "Loading Workshop…" : project?.clientName || "Production Synthesis Workshop"}
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Project ID: <span className="text-zinc-200">{projectId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:border-zinc-700 hover:text-white transition"
          >
            ← Mission Control
          </Link>
        </div>
      </header>

      {/* Global Status Notice */}
      {notice && (
        <div
          className={`flex items-center justify-between border p-4 text-xs font-mono transition-all ${
            notice.type === "success"
              ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-300"
              : "border-rose-900/60 bg-rose-950/40 text-rose-300"
          }`}
        >
          <span>{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            className="uppercase tracking-wider underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Split-Screen Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* LEFT COLUMN: Stage 1 Contact Report */}
        <div className="border border-zinc-800 bg-zinc-900/70 p-6 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-300">
              <FileText className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
                Stage 1 Client Contact Report
              </h2>
            </div>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 uppercase">
              Client Baseline
            </span>
          </div>

          <div className="text-xs text-zinc-400 leading-relaxed font-mono">
            Client requirements captured during discovery. This baseline is merged with internal production decisions below.
          </div>

          <div
            className="prose prose-invert prose-xs max-w-none rounded border border-zinc-800 bg-zinc-950 p-5 font-sans leading-relaxed text-zinc-300"
            dangerouslySetInnerHTML={{ __html: contactReportContent }}
          />
        </div>

        {/* RIGHT COLUMN: Daily.co Embed & Internal Production Debrief */}
        <div className="border border-zinc-800 bg-zinc-900/70 p-6 rounded space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-300">
              <Video className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
                Internal Production Debrief
              </h2>
            </div>
            <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-400 uppercase">
              Stage 2 Sync
            </span>
          </div>

          {/* Daily.co Call Embed Mockup / Live Signal */}
          <div className="relative rounded border border-zinc-800 bg-zinc-950 p-5 text-center space-y-3 overflow-hidden">
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-zinc-900/80 border border-zinc-800 px-2 py-1 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Daily.co Room Connected
            </div>
            <div className="pt-6">
              <Server className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="mt-2 text-xs font-mono text-zinc-300">
                Internal Engineering & Creative Debrief Call
              </p>
              <p className="text-[11px] text-zinc-500">
                Room: <code className="text-zinc-400">{project?.roomName || projectId}</code>
              </p>
            </div>
          </div>

          {/* Internal Transcript Uploader / Live Dictation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Internal Team Debrief Transcript
              </label>
              <button
                type="button"
                onClick={toggleDictation}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold transition ${
                  isListening
                    ? "bg-rose-950 text-rose-300 border border-rose-800 animate-pulse"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : <Mic className="h-3.5 w-3.5 text-zinc-400" />}
                <span>{isListening ? "Listening…" : "Dictate Live"}</span>
              </button>
            </div>

            <textarea
              value={internalTranscript}
              onChange={(e) => setInternalTranscript(e.target.value)}
              rows={8}
              placeholder="Paste or dictate internal engineering decisions, line item estimates, milestone phases, and architecture specs..."
              className="w-full rounded border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || !internalTranscript.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-zinc-100 py-3.5 px-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 transition"
          >
            <Sparkles className="h-4 w-4 text-zinc-900" />
            <span>
              {isSynthesizing
                ? "Synthesizing Team Brainstorm…"
                : "Synthesize Team Brainstorm & Generate Final Proposal"}
            </span>
          </button>
        </div>
      </div>

      {/* Synthesized Proposal Preview Output */}
      {synthesizedProposal && (
        <section className="border border-zinc-800 bg-zinc-900/70 p-6 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                Synthesized Final Proposal & Invoice Output
              </h3>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 underline hover:text-emerald-300"
            >
              <span>View in Mission Control</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div
            className="prose prose-invert prose-xs max-w-none rounded border border-zinc-800 bg-zinc-950 p-6 font-sans leading-relaxed text-zinc-200"
            dangerouslySetInnerHTML={{ __html: synthesizedProposal }}
          />
        </section>
      )}
    </main>
  );
}
