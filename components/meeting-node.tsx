"use client";

import { useEffect, useRef, useState, ChangeEvent, DragEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, MicOff, Paperclip, RefreshCw, Upload, FileAudio } from "lucide-react";

const stages = [
  "Reading transcript & discovery notes…",
  "Identifying key stakeholders & deliverables…",
  "Structuring scope, budget & timeline…",
  "Meta-Agent Auditing Quality & Alignment…",
  "Finalizing proposal approval packet…",
];

export function MeetingNode({ roomName }: { roomName: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramProjectId = searchParams.get("projectId") ?? "";

  const [projectId, setProjectId] = useState(paramProjectId);
  const [fetchingProject, setFetchingProject] = useState(false);
  const [notes, setNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{
    proposalId: string;
    confidenceScore: number;
    iterations: number;
    readyForApproval: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  // Multi-modal states
  const [isListeningNotes, setIsListeningNotes] = useState(false);
  const [isListeningTranscript, setIsListeningTranscript] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isSyncingFathom, setIsSyncingFathom] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const notesRecognitionRef = useRef<any>(null);
  const transcriptRecognitionRef = useRef<any>(null);

  // Resolve projectId via roomName if missing from URL
  useEffect(() => {
    if (paramProjectId) {
      setProjectId(paramProjectId);
      return;
    }
    if (!roomName) return;

    let isMounted = true;
    setFetchingProject(true);
    fetch(`/api/projects/by-room/${encodeURIComponent(roomName)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.projectId) {
          setProjectId(data.projectId);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setFetchingProject(false);
      });

    return () => {
      isMounted = false;
    };
  }, [paramProjectId, roomName]);

  // Stage animation during synthesis
  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, stages.length - 1));
    }, 1800);
    return () => window.clearInterval(timer);
  }, [loading]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      notesRecognitionRef.current?.stop();
      transcriptRecognitionRef.current?.stop();
    };
  }, []);

  // Native SpeechRecognition for Discovery Notes
  function toggleNotesDictation() {
    if (isListeningNotes) {
      notesRecognitionRef.current?.stop();
      setIsListeningNotes(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser Speech Recognition is not supported. Please try Google Chrome or MS Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setNotes((prev) => (prev ? `${prev} ${text}` : text));
    };

    recognition.onerror = () => setIsListeningNotes(false);
    recognition.onend = () => setIsListeningNotes(false);

    notesRecognitionRef.current = recognition;
    recognition.start();
    setIsListeningNotes(true);
  }

  // Native SpeechRecognition for Internal Sync Transcript
  function toggleTranscriptDictation() {
    if (isListeningTranscript) {
      transcriptRecognitionRef.current?.stop();
      setIsListeningTranscript(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser Speech Recognition is not supported. Please try Google Chrome or MS Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript((prev) => (prev ? `${prev}\n${text}` : text));
    };

    recognition.onerror = () => setIsListeningTranscript(false);
    recognition.onend = () => setIsListeningTranscript(false);

    transcriptRecognitionRef.current = recognition;
    recognition.start();
    setIsListeningTranscript(true);
  }

  // Audio File Upload & Transcription
  async function processAudioFile(file: File) {
    if (!file) return;
    setUploadingAudio(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Audio transcription failed.");
      }

      if (data.text) {
        setTranscript((prev) =>
          prev ? `${prev}\n\n${data.text}` : data.text
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to transcribe audio file.");
    } finally {
      setUploadingAudio(false);
    }
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processAudioFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      processAudioFile(file);
    } else if (file) {
      alert("Please upload an audio file (.mp3, .m4a, .wav).");
    }
  }

  // Sync Fathom API / Webhook Transcript Action
  async function syncFathomTranscript() {
    setIsSyncingFathom(true);
    setError("");

    try {
      const response = await fetch("/api/projects/simulate-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          roomName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync Fathom transcript.");
      }

      if (data.project?.fathomNotes) {
        setTranscript(data.project.fathomNotes);
      }
      if (data.proposal) {
        setResult({
          proposalId: data.proposal.id,
          confidenceScore: data.proposal.confidenceScore,
          iterations: data.proposal.iterations,
          readyForApproval: data.readyForApproval,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Fathom sync failed.");
    } finally {
      setIsSyncingFathom(false);
    }
  }

  async function synthesize() {
    setError("");
    setResult(null);
    setStep(0);
    setLoading(true);

    try {
      const response = await fetch("/api/meetings/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          discoveryNotes: notes,
          transcript,
          title: `Client Proposal · ${roomName.replace(/-[a-z0-9]{8}$/i, "")}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Synthesis failed.");
      }
      setResult({
        proposalId: data.proposal.id,
        confidenceScore: data.proposal.confidenceScore,
        iterations: data.proposal.iterations,
        readyForApproval: data.readyForApproval,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Synthesis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-8 text-zinc-950 md:px-14 md:py-12">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Meeting Node / {roomName}
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition"
        >
          ← Back to Mission Control
        </Link>
      </div>

      <div className="mt-8 grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.72fr]">
        <section>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl text-zinc-950">
            Make the meeting actionable.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
            Capture discovery signals via live voice dictation, audio transcription, or Fathom AI sync.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2 border-l-2 border-blue-600 pl-3.5 text-xs text-zinc-600">
              <span>Project Context:</span>
              {fetchingProject ? (
                <span className="animate-pulse text-zinc-400">Resolving project ID…</span>
              ) : projectId ? (
                <span className="font-mono font-medium text-zinc-900">{projectId}</span>
              ) : (
                <span className="font-mono text-amber-700">Project record not initialized</span>
              )}
            </div>

            {/* Discovery Notes with Voice Dictation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-900">
                  Discovery notes
                </label>
                <button
                  type="button"
                  onClick={toggleNotesDictation}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isListeningNotes
                      ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {isListeningNotes ? <MicOff className="h-3.5 w-3.5 text-rose-600" /> : <Mic className="h-3.5 w-3.5" />}
                  <span>{isListeningNotes ? "Listening..." : "Dictate Voice"}</span>
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What did the client need, who owns the decision, budget ranges, and key outcomes?"
                className="min-h-36 w-full border border-zinc-300 bg-white p-4 text-sm text-zinc-950 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Multi-Modal Internal Sync & Fathom Zone */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-semibold text-zinc-900">
                  Internal sync / Fathom transcript
                </label>

                {/* Multi-Modal Action Toolbar */}
                <div className="flex items-center gap-2">
                  {/* Action A: Dictate */}
                  <button
                    type="button"
                    onClick={toggleTranscriptDictation}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      isListeningTranscript
                        ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {isListeningTranscript ? <MicOff className="h-3.5 w-3.5 text-rose-600" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{isListeningTranscript ? "Dictating…" : "Dictate"}</span>
                  </button>

                  {/* Action B: Upload Audio File */}
                  <label className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer transition">
                    {uploadingAudio ? (
                      <svg className="h-3.5 w-3.5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Paperclip className="h-3.5 w-3.5" />
                    )}
                    <span>{uploadingAudio ? "Transcribing…" : "Upload Audio"}</span>
                    <input type="file" accept="audio/*" onChange={handleFileInputChange} className="hidden" />
                  </label>

                  {/* Action C: Fetch Fathom API */}
                  <button
                    type="button"
                    onClick={syncFathomTranscript}
                    disabled={isSyncingFathom}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncingFathom ? "animate-spin" : ""}`} />
                    <span>{isSyncingFathom ? "Syncing Fathom…" : "Sync Fathom AI"}</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone around Textarea */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative transition-all ${
                  isDragging
                    ? "ring-2 ring-blue-600 bg-blue-50/50"
                    : ""
                }`}
              >
                <textarea
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                  placeholder="Paste transcripts, drop an audio file (.mp3, .m4a), or sync directly from Fathom AI."
                  className="min-h-36 w-full border border-zinc-300 bg-white p-4 text-sm text-zinc-950 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />

                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 border-2 border-dashed border-blue-600 text-blue-800 text-sm font-semibold pointer-events-none">
                    <FileAudio className="h-6 w-6 mr-2 animate-bounce" />
                    Drop audio file to transcribe automatically
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={synthesize}
                disabled={loading || !projectId || (!notes.trim() && !transcript.trim())}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin-custom" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Synthesizing Proposal…</span>
                  </>
                ) : (
                  <span>End & Synthesize</span>
                )}
              </button>
            </div>
          </div>
        </section>

        <aside className="border-t border-zinc-200 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <h2 className="text-lg font-semibold text-zinc-900">Agent handoff workflow</h2>
          <div className="mt-6 space-y-4 text-xs text-zinc-600 leading-relaxed">
            <p className="border-l border-zinc-300 pl-3">
              <strong className="text-zinc-900">01. Execution Agent:</strong> Drafts comprehensive proposal HTML from discovery notes & transcript.
            </p>
            <p className="border-l border-zinc-300 pl-3">
              <strong className="text-zinc-900">02. Meta-Agent Auditor:</strong> Evaluates accuracy, checks constraints, and calculates confidence score.
            </p>
            <p className="border-l border-zinc-300 pl-3">
              <strong className="text-zinc-900">03. Approval Queue:</strong> Outputs exceeding 90% confidence are automatically routed to Mission Control.
            </p>
          </div>

          {result && (
            <div className="mt-10 border border-blue-200 bg-blue-50/80 p-6 transition-all">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                <p className="font-semibold text-blue-950">Synthesis Complete</p>
              </div>
              <p className="mt-3 text-sm text-zinc-800">
                Confidence Score: <strong className="text-blue-700">{result.confidenceScore}%</strong> · {result.iterations} audit cycle{result.iterations === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {result.readyForApproval
                  ? "Passed meta-audit gate (>90%). Ready for client dispatch."
                  : "Saved as draft for human review."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full rounded bg-blue-600 px-4 py-2.5 text-center text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  View in Mission Control →
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <strong>Synthesis error:</strong> {error}
            </div>
          )}
        </aside>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md border border-zinc-200 bg-[#FAFAF8] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                Visible Reasoning
              </p>
              <svg className="h-5 w-5 animate-spin-custom text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="mt-4 font-serif text-2xl text-zinc-950 min-h-[3.5rem]">
              {stages[step]}
            </h2>
            <div className="mt-6 flex gap-2">
              {stages.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 transition-all duration-300 ${
                    index <= step ? "bg-blue-600" : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
            <p className="mt-5 text-xs text-zinc-500 leading-relaxed">
              Execution and meta-audit agents are reconciling client requirements before generating the approval packet.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
