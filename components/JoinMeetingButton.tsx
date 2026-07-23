"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function JoinMeetingButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open && !loading) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading]);

  async function beginMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const clientName = form.get("clientName") as string;
    const clientEmail = form.get("clientEmail") as string;
    const projectName = form.get("projectName") as string;

    try {
      const response = await fetch("/api/projects/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientEmail, projectName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to initialize project meeting.");
      }

      // Updated redirect pointing to Phase 1 Client Discovery Node using project ID
      const targetUrl = data.redirectUrl || `/meeting/client/${data.projectId}`;
      router.push(targetUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start meeting.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-zinc-800 active:scale-[0.98]"
      >
        <span>Start meeting</span>
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="meeting-title"
          className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 p-4 backdrop-blur-sm transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setOpen(false);
          }}
        >
          <form
            onSubmit={beginMeeting}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-[#FAFAF8] p-8 shadow-2xl transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-zinc-950">Pre-Flight</p>
                <h2 id="meeting-title" className="mt-2 font-serif text-3xl text-zinc-950">
                  Start a client meeting
                </h2>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-50"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Client name
                <input
                  required
                  disabled={loading}
                  name="clientName"
                  placeholder="e.g., Genesis Kenya"
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:bg-zinc-100"
                />
              </label>

              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Client email
                <input
                  required
                  type="email"
                  disabled={loading}
                  name="clientEmail"
                  placeholder="e.g., team@client.com"
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:bg-zinc-100"
                />
              </label>

              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Project name
                <input
                  required
                  disabled={loading}
                  name="projectName"
                  placeholder="e.g., Moringa Hackathon launch"
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:bg-zinc-100"
                />
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-mono text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 text-xs font-mono font-semibold text-zinc-600 hover:text-zinc-950 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:active:scale-100"
              >
                {loading ? (
                  <span>Creating project…</span>
                ) : (
                  <span>Continue to meeting →</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
