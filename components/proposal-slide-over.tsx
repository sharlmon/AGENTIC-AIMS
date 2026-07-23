"use client";

import { useState, useEffect } from "react";
import { Archive, RotateCcw, Edit2, Check, X } from "lucide-react";
import type { ProposalCard } from "@/components/mission-control";

type ProposalSlideOverProps = {
  proposal: ProposalCard | null;
  onClose: () => void;
  onDispatch?: (id: string) => Promise<void>;
  onArchive?: (id: string, action: "archive" | "restore" | "delete") => Promise<void>;
  onUpdateContent?: (id: string, newContent: string) => void;
  isSending?: boolean;
};

export function ProposalSlideOver({
  proposal,
  onClose,
  onDispatch,
  onArchive,
  onUpdateContent,
  isSending = false,
}: ProposalSlideOverProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync editedContent when proposal changes or editing starts
  useEffect(() => {
    if (proposal) {
      setEditedContent(proposal.content || "");
      setIsEditing(false);
      setSaveError(null);
    }
  }, [proposal]);

  // Listen for Escape key to close slide-over (if not editing)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && proposal) {
        if (isEditing) {
          setIsEditing(false);
          setEditedContent(proposal.content || "");
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [proposal, isEditing, onClose]);

  if (!proposal) return null;

  const isDispatched = proposal.status === "dispatched";
  const isArchived = proposal.projectStatus === "archived";
  const canApprove = proposal.confidenceScore > 90 && !isDispatched && !isArchived;

  const problemText =
    proposal.problem ||
    proposal.discoveryNotes ||
    "Client requires end-to-end technical execution, architectural modernization, and high-reliability workflow automation.";

  const investmentText =
    proposal.investment ||
    "$15,000 – $35,000 USD (Fixed-fee milestone delivery)";

  const timelineText =
    proposal.timeline ||
    proposal.fathomNotes ||
    "3 to 4 Weeks from contract signing to production deployment.";

  // Extract deliverables
  const currentContent = isEditing ? editedContent : proposal.content;
  const extractedDeliverables: string[] = proposal.deliverables || [];
  if (extractedDeliverables.length === 0 && currentContent) {
    const liMatches = currentContent.match(/<li>(.*?)<\/li>/gi);
    if (liMatches) {
      liMatches.forEach((li) => {
        const cleanText = li.replace(/<\/?li>/gi, "").trim();
        if (cleanText) extractedDeliverables.push(cleanText);
      });
    }
  }
  if (extractedDeliverables.length === 0) {
    extractedDeliverables.push(
      "High-performance cloud & web application architecture",
      "Automated integration & data pipeline setup",
      "Comprehensive end-to-end testing & production deployment",
      "Executive handover documentation & SLA guarantees"
    );
  }

  async function handleSaveChanges() {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/proposals/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal!.id,
          content: editedContent,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save proposal edits.");
      }

      // Mutate local proposal object and invoke callback
      proposal!.content = editedContent;
      if (onUpdateContent) {
        onUpdateContent(proposal!.id, editedContent);
      }
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-title"
      className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isEditing) onClose();
      }}
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl border-l border-zinc-200 bg-[#FAFAF8] shadow-2xl transition-transform ease-in-out duration-300 overflow-y-auto flex flex-col justify-between text-zinc-950">
          
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-zinc-200 bg-[#FAFAF8]/95 px-6 py-6 backdrop-blur sm:px-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isArchived
                        ? "bg-zinc-400"
                        : isDispatched
                        ? "bg-emerald-500"
                        : proposal.confidenceScore > 90
                        ? "bg-blue-600"
                        : "bg-amber-500"
                    }`}
                  />
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                    Contact Synthesis Report
                  </p>
                </div>
                <h2
                  id="proposal-title"
                  className="mt-2 font-serif text-3xl tracking-tight text-zinc-950 sm:text-4xl"
                >
                  {proposal.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {onArchive && !isEditing && (
                  <button
                    type="button"
                    onClick={async () => {
                      await onArchive(proposal.id, isArchived ? "restore" : "archive");
                      onClose();
                    }}
                    title={isArchived ? "Restore to active queue" : "Archive proposal"}
                    className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 transition"
                  >
                    {isArchived ? <RotateCcw className="h-5 w-5" /> : <Archive className="h-5 w-5" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setEditedContent(proposal.content || "");
                    } else {
                      onClose();
                    }
                  }}
                  className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Close panel"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Metadata Pill */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-zinc-900">
                {proposal.client}
              </span>
              <span className="text-zinc-400">·</span>
              <span className="font-mono text-zinc-600">{proposal.recipientEmail}</span>
              <span className="text-zinc-400">·</span>
              <span className="inline-flex items-center gap-1 rounded bg-zinc-200/70 px-2 py-0.5 font-mono text-zinc-800">
                Confidence: <strong>{proposal.confidenceScore}%</strong>
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-zinc-200/70 px-2 py-0.5 text-zinc-700">
                Meta Cycles: <strong>{proposal.iterations}</strong>
              </span>
            </div>
          </div>

          {/* Body / Synthesized Data */}
          <div className="flex-1 px-6 py-8 space-y-10 sm:px-10">
            
            {saveError && (
              <div className="border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                {saveError}
              </div>
            )}

            {/* Executive Status Banner */}
            <div className="border-l-2 border-blue-600 bg-white p-5 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Audit Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {isEditing
                      ? "Human-in-the-Loop Refinement Mode"
                      : isArchived
                      ? "Archived Record"
                      : isDispatched
                      ? "Dispatched to Client"
                      : proposal.confidenceScore > 90
                      ? "Approved for Client Dispatch"
                      : "Pending Additional Meta-Agent Cycles"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    isEditing
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : isArchived
                      ? "bg-zinc-100 text-zinc-600 border border-zinc-300"
                      : isDispatched
                      ? "bg-emerald-100 text-emerald-800"
                      : proposal.confidenceScore > 90
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isEditing ? "Refining" : isArchived ? "Archived" : isDispatched ? "Delivered" : "Ready"}
                </span>
              </div>
            </div>

            {/* 1. Client Context / Problem */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">01</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                  Client Context & Problem Statement
                </h3>
              </div>
              <p className="text-base leading-7 text-zinc-700 font-sans">
                {problemText}
              </p>
            </section>

            {/* 2. Proposed Solution & Scope (Interactive Human-in-the-Loop Editor) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">02</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                    Proposed Solution & Scope
                  </h3>
                </div>
                {isEditing && (
                  <span className="text-[11px] font-mono text-blue-600 uppercase tracking-wider font-semibold">
                    [Live Editor Active]
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500">
                    Edit the proposal markup directly below. HTML formatting (headers, paragraphs, list items) will render live upon saving.
                  </p>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="w-full border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-900 leading-relaxed outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-inner"
                    placeholder="Enter updated proposal HTML markup..."
                  />
                </div>
              ) : proposal.content ? (
                <div
                  className="prose prose-zinc max-w-none text-zinc-800 text-sm leading-relaxed bg-white p-6 border border-zinc-200 rounded-none font-sans"
                  dangerouslySetInnerHTML={{ __html: proposal.content }}
                />
              ) : (
                <p className="text-base leading-7 text-zinc-700">
                  {proposal.solution || "Architected end-to-end software platform using modern stack."}
                </p>
              )}
            </section>

            {/* 3. Key Deliverables */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">03</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                  Key Deliverables
                </h3>
              </div>
              <ul className="space-y-2.5 pt-1">
                {extractedDeliverables.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-800">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                      ✓
                    </span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4 & 5. Investment & Timeline */}
            <div className="grid gap-6 sm:grid-cols-2">
              <section className="space-y-2 border border-zinc-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">04. Investment</p>
                <h4 className="font-serif text-xl font-semibold text-zinc-950">Estimated Budget</h4>
                <p className="text-sm font-medium text-zinc-800 pt-1">{investmentText}</p>
              </section>

              <section className="space-y-2 border border-zinc-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">05. Schedule</p>
                <h4 className="font-serif text-xl font-semibold text-zinc-950">Execution Timeline</h4>
                <p className="text-sm font-medium text-zinc-800 pt-1">{timelineText}</p>
              </section>
            </div>

            {/* Meta-Audit Verification */}
            {proposal.metaAuditNotes && (
              <section className="space-y-2 border-l-2 border-zinc-900 bg-zinc-100 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                  Meta-Agent Audit Log
                </p>
                <p className="text-xs text-zinc-700 leading-relaxed font-mono">
                  {proposal.metaAuditNotes}
                </p>
              </section>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 z-10 border-t border-zinc-200 bg-[#FAFAF8]/95 px-6 py-5 backdrop-blur sm:px-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setEditedContent(proposal.content || "");
                  } else {
                    onClose();
                  }
                }}
                className="px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition"
              >
                {isEditing ? "Cancel" : "Close Briefing"}
              </button>

              {onArchive && !isEditing && (
                <button
                  type="button"
                  onClick={async () => {
                    await onArchive(proposal.id, isArchived ? "restore" : "archive");
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition border border-zinc-300 bg-white rounded"
                >
                  {isArchived ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </>
                  ) : (
                    <>
                      <Archive className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Archive</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Refine / Save Changes / Approve & Send Actions */}
            <div className="flex items-center gap-3">
              {!isDispatched && !isArchived && (
                <>
                  {isEditing ? (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveChanges}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                    >
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>{isSaving ? "Saving changes…" : "Save changes"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setEditedContent(proposal.content || "");
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Refine</span>
                    </button>
                  )}
                </>
              )}

              {!isEditing && !isDispatched && !isArchived && onDispatch && (
                <button
                  type="button"
                  disabled={isSending || !canApprove}
                  onClick={async () => {
                    await onDispatch(proposal.id);
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                >
                  {isSending ? (
                    <span>Dispatching…</span>
                  ) : (
                    <span>Approve & Send Proposal</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
