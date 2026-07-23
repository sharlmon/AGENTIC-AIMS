"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Code2,
} from "lucide-react";

export default function WebPresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // SLIDE 1: Title Slide (Hook + Visual Hint)
    {
      title: "JITUME AGENCY OS",
      subtitle: "AI that turns raw client meetings into signed-ready proposals before your coffee even cools down.",
      tag: "48-HOUR AI HACKATHON 2026",
      presenter: "Presented by Sharlmon Junior · Technical Lead",
      badge: "BUILT BY TEAM AGENTIC AIMS",
      type: "title",
    },
    // SLIDE 2: Team Slide (Name, Role, AND What Each Person Built)
    {
      title: "THE TEAM",
      heading: "Agentic AIMS — Proof of Build",
      type: "team",
      members: [
        { name: "Sharlmon Junior", role: "Technical Lead", built: "Dual-Node Pipeline & HITL Engine", initial: "S", color: "bg-indigo-600" },
        { name: "Suleiman", role: "Lead Developer", built: "Prisma ORM & Webhook Ingestion", initial: "S", color: "bg-emerald-600" },
        { name: "Joshua", role: "AI Engineer", built: "Gemini 1.5 Pro & NIM Fallback", initial: "J", color: "bg-amber-600" },
        { name: "Kofa", role: "Product Designer", built: "Zinc 950 Stealth UI Workspace", initial: "K", color: "bg-purple-600" },
        { name: "Sharlmon", role: "Pitch & Ops Lead", built: "Resend Email & Calendar Engine", initial: "S", color: "bg-blue-600" },
      ],
    },
    // SLIDE 3: Problem Statement (Specific Scenario & Numbers)
    {
      title: "THE PROBLEM",
      heading: "Onboarding a client shouldn't feel like a second job.",
      type: "problem",
      bigStat: "10+ HRS",
      statLabel: "Agencies lose 10+ hours per week on manual meeting notes, calendar scheduling, and proposal drafting.",
      points: [
        "Manual Call Transcribing: Hours wasted typing summary notes by hand",
        "Scheduling Friction: A slow back-and-forth fight with Google Calendar",
        "Communication Delays: Slow follow-up emails lead to lost client interest",
        "Manual Proposal Creation: 4-hour drafting of proposals & invoice tables",
      ],
    },
    // SLIDE 4: Solution (One Clear Sentence)
    {
      title: "THE SOLUTION",
      heading: "Autonomous Dual-Node AI Architecture",
      type: "solution",
      oneSentence: "Jitume Agency OS is an autonomous dual-node AI system that turns raw discovery calls into signed-ready proposals in minutes.",
      phase1: "Phase 1: Zero-Touch Automation — Ingests calls, schedules team syncs, and emails clients automatically.",
      phase2: "Phase 2: Human-in-the-Loop Control — Gemini AI synthesizes proposals & HTML invoices with 1-click admin approval.",
    },
    // SLIDE 5: MVP / Core Features (3 Capabilities Max)
    {
      title: "MVP FEATURES",
      heading: "3 Core Capabilities What Users Can Do",
      type: "mvp",
      features: [
        {
          title: "1. Zero-Touch Discovery & Scheduling",
          desc: "Client calls are automatically transcribed into Contact Reports, and a 10:00 AM team sync with Google Meet is booked instantly.",
        },
        {
          title: "2. AI Proposal & Invoice Synthesis",
          desc: "Multi-transcript synthesis generates complete proposals and formatted HTML invoice tables using Gemini 1.5 Pro.",
        },
        {
          title: "3. Mission Control HITL Review Queue",
          desc: "Admins refine call notes inline, edit HTML markup live, and approve final email dispatches with a single click.",
        },
      ],
    },
    // SLIDE 6: Live Demo Walkthrough
    {
      title: "LIVE DEMONSTRATION",
      heading: "Live Onboarding Walkthrough",
      type: "demo",
      steps: [
        "Step 1: Init Project ('george' / 'E-commerce Platform Development')",
        "Step 2: Fathom Webhook Ingestion & Zero-Touch Contact Report",
        "Step 3: Google Calendar Auto-Scheduler (Tomorrow 10:00 AM Sync)",
        "Step 4: Mission Control HITL Review & One-Click Resend Dispatch",
      ],
    },
    // SLIDE 7: System Architecture & Tech Stack
    {
      title: "SYSTEM ARCHITECTURE",
      heading: "Production-Grade Tech Stack",
      type: "architecture",
      stacks: [
        { title: "Frontend UI", desc: "Next.js 14 App Router, React 18, TypeScript, Tailwind v4 Stealth Theme" },
        { title: "AI LLM Engines", desc: "Primary: Google Gemini 1.5 Pro | Fallback: NVIDIA NIM (Llama 3.3 70B)" },
        { title: "Persistence", desc: "Prisma ORM v6 with embedded SQLite database (dev.db)" },
        { title: "Integrations", desc: "Fathom Webhooks, Google Calendar API (Service Auth), Resend API" },
      ],
    },
    // SLIDE 8: Impact & Risk Strategy
    {
      title: "IMPACT & RISK STRATEGY",
      heading: "Addressing Risks & Business Impact",
      type: "risk",
      risks: [
        "LLM Hallucinations in Pricing/Scope",
        "API Rate Limits during Peak Loads",
        "Client Email Sandbox Restrictions",
      ],
      mitigations: [
        "HITL Review Gate ensures 100% human oversight",
        "NVIDIA NIM (Llama 3.3 70B) auto-failover engine",
        "Verified domain fallback (Sharlmon <hello@sharl-tech.co.ke>)",
      ],
    },
    // SLIDE 9: Conclusion / Q&A Slide
    {
      title: "JITUME AGENCY OS",
      subtitle: "Turning client meetings into signed contracts in minutes.",
      tag: "THANK YOU — READY FOR Q&A",
      badge: "TEAM AGENTIC AIMS",
      type: "outro",
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <main className="min-h-screen bg-[#0F111A] text-white flex flex-col justify-between p-8 md:p-12 font-sans select-none overflow-hidden relative">
      
      {/* Top Header / Progress Bar */}
      <header className="flex items-center justify-between z-10 border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
            Official 9-Slide Deck · Agentic AIMS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-zinc-400">
            Slide <span className="text-white font-bold">{currentSlide + 1}</span> of {slides.length}
          </span>
          <Link
            href="/admin"
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider underline border border-zinc-800 rounded-xl px-3 py-1.5 bg-zinc-900/50"
          >
            Mission Control
          </Link>
        </div>
      </header>

      {/* Main Slide Content */}
      <div className="my-auto py-6 max-w-6xl mx-auto w-full z-10 transition-all duration-300">
        
        {/* SLIDE 1: TITLE */}
        {slide.type === "title" && (
          <div className="space-y-8 text-center max-w-4xl mx-auto">
            <span className="inline-block rounded-full bg-indigo-950/80 border border-indigo-500/30 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-indigo-300">
              {slide.tag}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed max-w-3xl mx-auto">
              {slide.subtitle}
            </p>
            <div className="pt-6 flex flex-col items-center gap-3">
              <span className="rounded-2xl border border-indigo-500/40 bg-indigo-600/20 px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-200">
                {slide.badge}
              </span>
              <p className="text-sm font-mono text-zinc-400">{slide.presenter}</p>
            </div>
          </div>
        )}

        {/* SLIDE 2: TEAM */}
        {slide.type === "team" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              {slide.members?.map((m, idx) => (
                <div key={idx} className="border border-zinc-800 bg-[#1B1F30] p-5 rounded-2xl text-center space-y-3 shadow-lg">
                  <div className={`h-12 w-12 rounded-full ${m.color} text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md`}>
                    {m.initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{m.name}</h3>
                    <p className="text-[11px] font-mono font-bold text-indigo-400 mt-0.5">{m.role}</p>
                    <p className="text-[10px] font-mono text-zinc-400 mt-2 border-t border-zinc-800 pt-2">{m.built}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 3: PROBLEM */}
        {slide.type === "problem" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 border border-rose-500/30 bg-[#1B1F30] p-8 rounded-2xl text-center space-y-4">
                <span className="text-6xl font-bold font-serif text-amber-400 block">{slide.bigStat}</span>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">{slide.statLabel}</p>
              </div>
              <div className="md:col-span-7 border border-zinc-800 bg-[#1B1F30] p-6 rounded-2xl space-y-3">
                {slide.points?.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-xs font-mono text-zinc-200">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: SOLUTION */}
        {slide.type === "solution" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="border border-indigo-500/40 bg-[#1B1F30] p-8 rounded-2xl space-y-6">
              <p className="font-serif text-2xl font-bold text-white leading-relaxed">{slide.oneSentence}</p>
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                  {slide.phase1}
                </div>
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                  {slide.phase2}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: MVP */}
        {slide.type === "mvp" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {slide.features?.map((f, idx) => (
                <div key={idx} className="border border-zinc-800 bg-[#1B1F30] p-6 rounded-2xl space-y-3">
                  <h3 className="text-sm font-mono font-bold uppercase text-indigo-300">{f.title}</h3>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 6: DEMO */}
        {slide.type === "demo" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="border border-emerald-500/40 bg-[#1B1F30] p-8 rounded-2xl space-y-4">
              {slide.steps?.map((st, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <PlayCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-white">{st}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 7: ARCHITECTURE */}
        {slide.type === "architecture" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {slide.stacks?.map((st, idx) => (
                <div key={idx} className="border border-zinc-800 bg-[#1B1F30] p-5 rounded-2xl space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-indigo-300">{st.title}</h3>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 8: RISK */}
        {slide.type === "risk" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">{slide.title}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-1">{slide.heading}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-rose-500/40 bg-[#1B1F30] p-6 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-rose-400 tracking-wider block">
                  Identified Risks
                </span>
                <ul className="space-y-3">
                  {slide.risks?.map((r, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-mono text-zinc-200">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-emerald-500/40 bg-[#1B1F30] p-6 rounded-2xl space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider block">
                  Mitigation & Proof
                </span>
                <ul className="space-y-3">
                  {slide.mitigations?.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-mono text-zinc-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: OUTRO */}
        {slide.type === "outro" && (
          <div className="space-y-8 text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-6xl md:text-7xl font-bold text-white tracking-tight">
              {slide.title}
            </h1>
            <p className="text-2xl text-zinc-400 font-light max-w-2xl mx-auto">
              {slide.subtitle}
            </p>
            <div className="pt-6">
              <span className="inline-block rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-mono font-bold uppercase tracking-wider text-white shadow-lg">
                {slide.tag}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <footer className="flex items-center justify-between z-10 pt-4 border-t border-zinc-800/80">
        <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
          Use <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">←</kbd> and <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">→</kbd> arrow keys to navigate
        </span>

        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 border border-zinc-800 bg-zinc-900 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-300 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1.5 px-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? "w-6 bg-indigo-500" : "w-2 bg-zinc-800 hover:bg-zinc-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1 border border-zinc-800 bg-zinc-900 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-300 transition"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

    </main>
  );
}
