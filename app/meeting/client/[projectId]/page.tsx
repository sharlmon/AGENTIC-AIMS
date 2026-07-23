"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";

export default function ClientDiscoveryMeetingPage({ params }: { params: { projectId: string } }) {
  const projectId = decodeURIComponent(params.projectId);
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  function toggleDictation() {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Speech Recognition not supported.");
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

  async function submitDiscovery() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/agents/contact-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          transcript,
          discoveryNotes: notes,
          title: "Executive Contact Report",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate contact report.");

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Client discovery processing failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-8 text-zinc-950 md:px-14 md:py-12">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Node 01 / Client Discovery Sync
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold">Client Meeting Node</h1>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-950"
        >
          ← Back to Mission Control
        </Link>
      </div>

      <div className="mt-8 grid max-w-5xl gap-12 lg:grid-cols-[1fr_0.75fr]">
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-900">Live Client Transcript / Voice Signal</label>
              <button
                type="button"
                onClick={toggleDictation}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isListening
                    ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5 text-rose-600" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{isListening ? "Listening…" : "Dictate Live"}</span>
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Record or paste the client discovery conversation signal..."
              className="min-h-36 w-full border border-zinc-300 bg-white p-4 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Discovery Notes & Key Requirements</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key project goals, decision-maker constraints, and delivery expectations..."
              className="min-h-28 w-full border border-zinc-300 bg-white p-4 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={submitDiscovery}
            disabled={loading || (!transcript.trim() && !notes.trim())}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-zinc-300"
          >
            {loading ? "Synthesizing Contact Report…" : "Complete Discovery & Schedule Sync →"}
          </button>
        </section>

        <aside className="border-t border-zinc-200 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <h2 className="text-base font-semibold text-zinc-900">Phase 1: Discovery Handoff</h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
            Synthesizes an executive Contact Report, auto-schedules the internal production meeting on Google Calendar, and updates project stage to <strong className="text-zinc-900">internal_sync</strong>.
          </p>

          {result && (
            <div className="mt-8 border border-emerald-200 bg-emerald-50/80 p-6">
              <p className="font-semibold text-emerald-950">✓ Contact Report Synthesized</p>
              <p className="mt-2 text-xs text-zinc-800">
                Confidence Score: <strong className="text-emerald-700">{result.proposal?.confidenceScore}%</strong>
              </p>
              {result.scheduleInfo && (
                <div className="mt-4 border-t border-emerald-200 pt-3 text-xs text-zinc-700 space-y-1">
                  <p><strong>Scheduled Internal Sync:</strong> {result.scheduleInfo.eventTime}</p>
                  <p><strong>Google Meet Link:</strong> <a href={result.scheduleInfo.meetLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">{result.scheduleInfo.meetLink}</a></p>
                </div>
              )}
              <button
                onClick={() => router.push(`/meeting/internal/${encodeURIComponent(projectId)}`)}
                className="mt-6 w-full rounded bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition"
              >
                Proceed to Phase 2: Internal Sync →
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              {error}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
