"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Send,
  RefreshCw,
  ArrowLeft,
  FileText,
  Edit3,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";

export default function HITLReviewPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const projectId = decodeURIComponent(params.projectId);

  const [project, setProject] = useState<any>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fully interactive state for left & right columns
  const [editedDiscoveryNotes, setEditedDiscoveryNotes] = useState("");
  const [editedContactReport, setEditedContactReport] = useState("");
  const [editedProposal, setEditedProposal] = useState("");

  const [isApproving, setIsApproving] = useState(false);
  const [isReRunning, setIsReRunning] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function fetchProjectData() {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
        const data = await res.json();
        if (res.ok && data.project) {
          setProject(data.project);

          const foundProposalId = data.project.proposals?.[0]?.id || null;
          setProposalId(foundProposalId);

          const notes =
            data.project.discoveryNotes ||
            data.project.fathomNotes ||
            "Stage 1 Fathom discovery call notes captured.";
          setEditedDiscoveryNotes(notes);

          const report =
            data.project.contactReport ||
            data.project.proposals?.find((p: any) => p.type === "CONTACT_REPORT")?.content ||
            "Executive Contact Report synthesized during Stage 1.";
          setEditedContactReport(report);

          const proposalContent =
            data.project.finalRefinedProposal ||
            data.project.proposals?.[0]?.content ||
            "";
          setEditedProposal(proposalContent);
        }
      } catch (err) {
        console.warn("Failed to load review project data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectData();
  }, [projectId]);

  // Handle Approve & Dispatch Proposal with modified state
  async function handleApproveAndDispatch() {
    setIsApproving(true);
    setNotice(null);
    try {
      // 1. Save modified proposal content to DB if proposalId exists
      if (proposalId) {
        await fetch("/api/proposals/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposalId,
            content: editedProposal,
          }),
        });
      }

      // 2. Dispatch proposal email via Resend API (passing both projectId & proposalId)
      const dispatchRes = await fetch("/api/proposals/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project?.id || projectId,
          proposalId: proposalId || undefined,
          content: editedProposal,
        }),
      });

      const dispatchData = await dispatchRes.json();
      if (!dispatchRes.ok) throw new Error(dispatchData.error || "Dispatch failed.");

      setNotice({ message: "Proposal approved and dispatched to client email via Resend!", type: "success" });
      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    } catch (err: any) {
      setNotice({ message: err?.message || "Failed to approve proposal.", type: "error" });
    } finally {
      setIsApproving(false);
    }
  }

  // Handle Trigger Synthesis Now / Re-Run AI with modified left-column state
  async function handleReRunAI() {
    setIsReRunning(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalTranscript: project?.internalTranscript || editedDiscoveryNotes,
          contactReport: editedContactReport,
          discoveryNotes: editedDiscoveryNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Re-synthesis failed.");

      if (data.proposalId) {
        setProposalId(data.proposalId);
      }
      setEditedProposal(data.finalRefinedProposal);
      setNotice({
        message: "AI Pipeline re-executed using your refined baseline notes & contact report!",
        type: "success",
      });
    } catch (err: any) {
      setNotice({ message: err?.message || "Re-run failed.", type: "error" });
    } finally {
      setIsReRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-zinc-950 p-6 md:p-12 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-blue-600">
              Human-in-the-Loop Review Dashboard
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            {loading ? "Loading Project Review…" : `Review Proposal · ${project?.clientName || projectId}`}
          </h1>
          <p className="mt-1 text-xs font-mono text-zinc-500">
            Client Email: <span className="text-zinc-800 font-semibold">{project?.clientEmail || "client@agency.com"}</span>
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition border border-zinc-200 rounded-2xl px-5 py-2.5 bg-white shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Mission Control</span>
        </Link>
      </header>

      {/* Global Status Notice */}
      {notice && (
        <div
          className={`mt-6 flex items-center justify-between border p-4 text-xs font-mono rounded-2xl transition-all ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
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

      {/* Async Processing Loading Banner */}
      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center p-16 border border-zinc-200 rounded-2xl bg-white space-y-4">
          <Clock className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm font-mono text-zinc-600">
            Fetching project details & checking asynchronous AI synthesis status…
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          
          {/* LEFT COLUMN: Interactive Context & Stage 1 Report Editor */}
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-700" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                  Call Context & Stage 1 Baseline
                </h2>
              </div>
              <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[10px] font-mono text-zinc-800 uppercase font-semibold">
                Interactive HITL Inputs
              </span>
            </div>

            {/* Editable Fathom Discovery Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700">
                  Fathom Discovery Notes Signal
                </label>
                <span className="text-[10px] font-mono text-zinc-400">Editable Notes</span>
              </div>
              <textarea
                value={editedDiscoveryNotes}
                onChange={(e) => setEditedDiscoveryNotes(e.target.value)}
                rows={6}
                placeholder="Edit Fathom discovery notes..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 leading-relaxed"
              />
            </div>

            {/* Editable Stage 1 Contact Report */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700">
                  Stage 1 Executive Contact Report
                </label>
                <span className="text-[10px] font-mono text-zinc-400">Editable HTML Report</span>
              </div>
              <textarea
                value={editedContactReport}
                onChange={(e) => setEditedContactReport(e.target.value)}
                rows={10}
                placeholder="Edit Stage 1 Contact Report HTML..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 leading-relaxed"
              />
            </div>

            {/* Contact Report Live Render Preview */}
            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700">
                Contact Report Live Preview
              </label>
              <div
                className="prose prose-zinc prose-xs max-w-none rounded-2xl border border-zinc-200 bg-zinc-50 p-5 font-sans leading-relaxed text-zinc-800 max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: editedContactReport }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: AI Proposal Output & HITL Live Editor */}
          <div className="border border-zinc-200 bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                  Synthesized Final Proposal Output
                </h2>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-mono text-blue-700 uppercase font-semibold">
                Editable Stage 2
              </span>
            </div>

            {!editedProposal ? (
              <div className="p-8 border border-dashed border-zinc-300 rounded-2xl bg-zinc-50 text-center space-y-3">
                <Sparkles className="h-6 w-6 text-zinc-400 mx-auto" />
                <p className="text-xs font-mono text-zinc-600">
                  AI proposal output has not been generated yet. Refine the baseline context on the left and click below to synthesize.
                </p>
                <button
                  onClick={handleReRunAI}
                  disabled={isReRunning}
                  className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-zinc-800 disabled:bg-zinc-300 transition shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isReRunning ? "animate-spin" : ""}`} />
                  <span>Trigger Synthesis Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700">
                      Edit Proposal HTML Markup Inline
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">Live HTML Editor</span>
                  </div>
                  <textarea
                    value={editedProposal}
                    onChange={(e) => setEditedProposal(e.target.value)}
                    rows={14}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700">
                    Live HTML Rendered Preview
                  </label>
                  <div
                    className="prose prose-zinc max-w-none rounded-2xl border border-zinc-200 bg-white p-6 font-sans text-xs leading-relaxed text-zinc-900 max-h-80 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: editedProposal }}
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleApproveAndDispatch}
                    disabled={isApproving || !editedProposal}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-black py-3.5 px-6 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-zinc-800 disabled:bg-zinc-300 transition shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isApproving ? "Dispatching via Resend…" : "Approve & Dispatch Proposal"}</span>
                  </button>

                  <button
                    onClick={handleReRunAI}
                    disabled={isReRunning}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 px-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 disabled:bg-zinc-100 transition shadow-sm"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isReRunning ? "animate-spin text-blue-600" : ""}`} />
                    <span>Re-Run AI Synthesis</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </main>
  );
}
