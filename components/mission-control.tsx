"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Archive, RotateCcw, Trash2, Check, FileText } from "lucide-react";
import { JoinMeetingButton } from "@/components/JoinMeetingButton";
import { ProposalSlideOver } from "@/components/proposal-slide-over";

export type ProposalCard = {
  id: string;
  projectId?: string;
  type?: string;
  client: string;
  clientEmail?: string;
  serviceLine?: string | null;
  title: string;
  content: string;
  status: string;
  stage?: string;
  projectStatus?: string;
  recipientEmail: string;
  confidenceScore: number;
  iterations: number;
  metaAuditNotes: string;
  approvedAt?: string | null;
  dispatchedAt?: string | null;
  createdAt: string;
  discoveryNotes?: string | null;
  fathomNotes?: string | null;
  problem?: string;
  solution?: string;
  deliverables?: string[];
  investment?: string;
  timeline?: string;
};

type MissionControlProps = {
  proposals: ProposalCard[];
  fetchError?: string | null;
};

type StepDef = {
  title: string;
  description: string;
};

const stepsDefinition: StepDef[] = [
  {
    title: "Discover",
    description: "Input initial client meeting transcript.",
  },
  {
    title: "Understand",
    description: "Synthesize Contact Report & Google Calendar auto-sync.",
  },
  {
    title: "Create",
    description: "Input internal sync & synthesize Proposal + Invoice.",
  },
  {
    title: "Review",
    description: "Dual-Agent audit & Human-in-the-loop refine.",
  },
  {
    title: "Deliver",
    description: "Dispatch finalized proposal package via email.",
  },
];

function getStepIndex(proposal: ProposalCard | null): number {
  if (!proposal) return 0;
  const stage = proposal.stage?.toLowerCase();
  const status = proposal.status?.toLowerCase();

  if (status === "dispatched" || stage === "delivered") return 4;
  if (status === "ready_for_dispatch" || status === "approved" || stage === "ready_for_dispatch") return 3;
  if (stage === "internal_sync") return 2;
  if (proposal.type === "CONTACT_REPORT") return 1;
  if (stage === "discovery") return 0;

  return 0;
}

function relativeTime(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `Generated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Generated ${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `Generated ${days} d ago`;
}

export function MissionControl({ proposals, fetchError }: MissionControlProps) {
  const [items, setItems] = useState<ProposalCard[]>(proposals);
  const [activeTab, setActiveTab] = useState<"active" | "delivered" | "archived">("active");
  const [activeProposalId, setActiveProposalId] = useState<string | null>(proposals[0]?.id || null);
  const [selectedProposal, setSelectedProposal] = useState<ProposalCard | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(
    fetchError ? { message: fetchError, type: "error" } : null
  );

  const activeProposal =
    items.find((item) => item.id === activeProposalId) || items[0] || null;
  const currentStepIndex = getStepIndex(activeProposal);
  const isAllPhasesCompleted = currentStepIndex === 4;

  const activeQueue = items.filter(
    (item) => item.projectStatus !== "archived" && item.status !== "dispatched"
  );
  const deliveredQueue = items.filter(
    (item) => item.projectStatus !== "archived" && item.status === "dispatched"
  );
  const archivedQueue = items.filter((item) => item.projectStatus === "archived");

  const displayedItems =
    activeTab === "active"
      ? activeQueue
      : activeTab === "delivered"
      ? deliveredQueue
      : archivedQueue;

  async function dispatch(id: string) {
    setSending(id);
    setNotice(null);
    try {
      const response = await fetch("/api/proposals/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id }),
      });
      const result = await response.json();

      if (response.ok) {
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, status: "dispatched", stage: "delivered" } : item
          )
        );
        if (selectedProposal?.id === id) {
          setSelectedProposal((current) =>
            current ? { ...current, status: "dispatched", stage: "delivered" } : null
          );
        }
        setNotice({
          message: "Proposal successfully dispatched to client.",
          type: "success",
        });
      } else {
        setNotice({
          message: result.error || "Dispatch failed.",
          type: "error",
        });
      }
    } catch (err) {
      setNotice({
        message: "Network error occurred while dispatching proposal email.",
        type: "error",
      });
    } finally {
      setSending(null);
    }
  }

  async function handleArchive(id: string, action: "archive" | "restore" | "delete") {
    setNotice(null);
    try {
      const response = await fetch("/api/proposals/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id, action }),
      });
      const result = await response.json();

      if (response.ok) {
        if (action === "delete") {
          setItems((current) => current.filter((item) => item.id !== id));
          setNotice({ message: "Proposal deleted permanently.", type: "success" });
        } else if (action === "restore") {
          setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, projectStatus: "active" } : item))
          );
          setNotice({ message: "Proposal restored to active queue.", type: "success" });
        } else {
          setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, projectStatus: "archived" } : item))
          );
          setNotice({ message: "Proposal archived.", type: "success" });
        }
      } else {
        setNotice({ message: result.error || "Archive action failed.", type: "error" });
      }
    } catch (err) {
      setNotice({ message: "Failed to process archive action.", type: "error" });
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-8 text-zinc-950 md:px-14 md:py-12 font-sans">
      <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-mono font-bold uppercase tracking-[0.22em] text-zinc-950">
            Jitume Agency OS · Stealth Pipeline
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl text-zinc-950">
            Mission Control
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <JoinMeetingButton />
        </div>
      </header>

      {/* Subtle Stealth Error/Notice Banner */}
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

      <section className="grid gap-12 py-10 lg:grid-cols-[1.6fr_0.8fr]">
        <div>
          {/* Header & Tab Filter Row */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-zinc-950">
              Client decisions queue
            </h2>

            {/* Minimalist Filter Tabs */}
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-200/70 p-1 text-xs font-mono text-zinc-700">
              <button
                onClick={() => setActiveTab("active")}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  activeTab === "active"
                    ? "bg-zinc-950 text-white shadow-sm font-bold"
                    : "hover:text-zinc-950"
                }`}
              >
                Active Queue ({activeQueue.length})
              </button>
              <button
                onClick={() => setActiveTab("delivered")}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  activeTab === "delivered"
                    ? "bg-zinc-950 text-white shadow-sm font-bold"
                    : "hover:text-zinc-950"
                }`}
              >
                Delivered ({deliveredQueue.length})
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  activeTab === "archived"
                    ? "bg-zinc-950 text-white shadow-sm font-bold"
                    : "hover:text-zinc-950"
                }`}
              >
                Archived ({archivedQueue.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {displayedItems.length === 0 && (
              <div className="border border-dashed border-zinc-300 bg-white/60 p-12 text-center text-zinc-500 rounded-2xl">
                <p className="font-serif text-xl text-zinc-900">
                  {activeTab === "active"
                    ? "No active proposals pending"
                    : activeTab === "delivered"
                    ? "No delivered proposals yet"
                    : "No archived proposals"}
                </p>
                <p className="mt-2 text-xs font-mono text-zinc-600">
                  {activeTab === "active"
                    ? "Start a new client meeting to run the synthesis loop."
                    : "Proposal actions will appear here once updated."}
                </p>
              </div>
            )}

            {displayedItems.map((proposal) => {
              const isDispatched = proposal.status === "dispatched";
              const isArchived = proposal.projectStatus === "archived";
              const isSending = sending === proposal.id;
              const canApprove = proposal.confidenceScore > 90 && !isDispatched && !isArchived;
              const isActiveSelected = activeProposalId === proposal.id;

              return (
                <article
                  key={proposal.id}
                  onClick={() => setActiveProposalId(proposal.id)}
                  className={`group relative cursor-pointer border bg-white p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all ${
                    isActiveSelected
                      ? "border-zinc-950 ring-1 ring-zinc-950 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                      : "border-zinc-200 hover:border-zinc-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              isArchived
                                ? "bg-zinc-400"
                                : isDispatched
                                ? "bg-emerald-500"
                                : proposal.confidenceScore > 90
                                ? "bg-zinc-950"
                                : "bg-amber-500"
                            }`}
                          />
                          <p
                            className={`text-xs font-mono font-bold uppercase tracking-widest ${
                              isArchived
                                ? "text-zinc-500"
                                : isDispatched
                                ? "text-emerald-700"
                                : proposal.confidenceScore > 90
                                ? "text-zinc-950"
                                : "text-amber-700"
                            }`}
                          >
                            {isArchived
                              ? "ARCHIVED"
                              : isDispatched
                              ? "DELIVERED TO CLIENT"
                              : "READY FOR REVIEW"}
                          </p>
                        </div>

                        {/* Archive / Restore Button */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                          {isArchived ? (
                            <>
                              <button
                                type="button"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleArchive(proposal.id, "restore");
                                }}
                                title="Restore to active queue"
                                className="p-1.5 text-zinc-500 hover:text-zinc-950 transition"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleArchive(proposal.id, "delete");
                                }}
                                title="Delete permanently"
                                className="p-1.5 text-rose-500 hover:text-rose-700 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleArchive(proposal.id, "archive");
                              }}
                              title="Archive proposal"
                              className="p-1.5 text-zinc-400 hover:text-zinc-900 transition"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl font-semibold text-zinc-950 group-hover:text-zinc-800 transition-colors">
                        {proposal.title}
                      </h3>

                      <p className="text-xs font-mono text-zinc-600">
                        <span className="font-bold text-zinc-900">{proposal.client}</span> · {relativeTime(proposal.createdAt)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-600 border-t border-zinc-100">
                        <span className="inline-flex items-center gap-1 rounded-2xl bg-zinc-100 px-3 py-1 text-zinc-800">
                          Confidence: <strong className="text-zinc-950">{proposal.confidenceScore}%</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-2xl bg-zinc-100 px-3 py-1 text-zinc-700">
                          Meta-Agent Cycles: <strong>{proposal.iterations}</strong>
                        </span>

                        {/* HITL Review & Refine Button */}
                        <div className="ml-auto flex items-center gap-2">
                          <Link
                            href={`/admin/review/${proposal.projectId || proposal.id}`}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="text-xs font-mono font-bold text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-900 rounded-2xl px-4 py-1.5 transition shadow-sm"
                          >
                            Review & Refine →
                          </Link>
                        </div>
                      </div>
                    </div>

                    {!isDispatched && !isArchived && (
                      <div className="sm:self-center">
                        <button
                          disabled={isSending || !canApprove}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            dispatch(proposal.id);
                          }}
                          title={
                            !canApprove
                              ? "Proposal confidence must exceed 90% before dispatch"
                              : "Approve and send email to client"
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
                        >
                          {isSending ? (
                            <span>Sending…</span>
                          ) : (
                            <span>Approve & send</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Dynamic Data-Driven Vertical Stepper Sidebar */}
        <aside className="border-l border-zinc-200 pl-0 lg:pl-10">
          <p className="text-xs font-mono font-bold uppercase tracking-[0.22em] text-zinc-500">
            {activeProposal
              ? `WORKFLOW: ${activeProposal.client.toUpperCase()}`
              : "WORKFLOW: OVERVIEW"}
          </p>

          {/* Prominent Completion Badge */}
          {isAllPhasesCompleted && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 shadow-sm animate-in fade-in">
              <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
              <span>✓ PROJECT COMPLETED & DELIVERED</span>
            </div>
          )}

          <div className="relative mt-8 ml-2 border-l border-zinc-200 pl-6 space-y-8">
            {stepsDefinition.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.title} className="relative flex items-start gap-3">
                  {/* Stepper Node Marker */}
                  <div className="absolute -left-[33px] top-0.5 flex items-center justify-center bg-[#FAFAF8] p-1">
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-zinc-950 fill-zinc-950 stroke-[#FAFAF8]" />
                    )}
                    {isCurrent && (
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-950" />
                      </span>
                    )}
                    {!isCompleted && !isCurrent && (
                      <Circle className="h-3 w-3 text-zinc-300 stroke-[2]" />
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-mono tracking-tight transition-colors ${
                        isCompleted
                          ? "font-bold text-zinc-950"
                          : isCurrent
                          ? "font-bold text-zinc-950"
                          : "text-zinc-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    <p className="text-xs text-zinc-500 leading-normal font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      {/* Slide Over Briefing Modal */}
      {selectedProposal && (
        <ProposalSlideOver
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onDispatch={(id: string) => dispatch(id)}
          onArchive={(id: string, action: "archive" | "restore" | "delete") => handleArchive(id, action)}
          onUpdateContent={(id: string, content: string) => {
            setItems((current) =>
              current.map((item) => (item.id === id ? { ...item, content } : item))
            );
            setSelectedProposal((current) => (current ? { ...current, content } : null));
          }}
          isSending={sending === selectedProposal.id}
        />
      )}
    </main>
  );
}
