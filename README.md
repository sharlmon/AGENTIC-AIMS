# Synthos — Creative Intelligence & Project Automation Platform

**Synthos** is the operating system for creative intelligence. It helps creative teams and agencies turn client conversations and creative briefs into structured project intelligence, strategic direction, proposals, quotes, and human-approved deliverables.

The platform is built on a single principle:

> **AI assists. Humans decide.**

AI accelerates the work — understanding requirements, analysing briefs, processing transcripts, synthesising insight, drafting proposals and quotes. Humans remain responsible for reviewing, editing, making strategic decisions, and approving before anything reaches a client.

---

## The workflow

Every project moves through a connected, ten-stage workflow:

1. **Creative Brief** — capture client objectives, audience, direction and constraints.
2. **Client Call** — schedule and run the discovery conversation.
3. **Meeting Transcript** — an intelligent workspace that extracts meaning, decisions and action items.
4. **AI Understanding** — raw information becomes structured intelligence (wants, objectives, constraints, risks, missing info, questions).
5. **Structured Project Brief** — a refined brief combining every source.
6. **Creative Intelligence Workshop** — humans and AI build the strategic direction together.
7. **AI Synthesis** — all intelligence combined into clear direction.
8. **Proposal** — a professional, AI-drafted, human-approved proposal.
9. **Quote** — a professional quote, ready for review.
10. **Human Approval** — the final gate where humans decide.

---

## Navigation

- **Overview** — what needs your attention next.
- **Projects** — the central project workspace (grid / list, search, filter, sort).
- **Briefs** — every client brief with the AI's read.
- **Meetings** — client calls and extracted intelligence.
- **AI Intelligence** — structured understanding across projects.
- **Workshops** — creative intelligence workshops in progress.
- **Proposals** — proposals with AI/human attribution.
- **Quotes** — professional quotes ready for review.
- **Approvals** — the Human + AI decision center.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **React** client components with a lightweight store (`lib/store.tsx`)
- Custom design system in `app/globals.css` — calm, editorial, premium. No off-the-shelf dashboard look.
- Typography: Fraunces (serif display) + Inter (sans) + IBM Plex Mono.

---

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/dashboard/overview`.

The application connects to a PostgreSQL database via Prisma. Projects, briefs, proposals, and quotes are persisted in the database.

---

## Project structure

```
app/
  overview/        Overview — attention-first workspace
  projects/        Projects list + [id] project workspace (10 stages)
    [id]/stages/   Brief, Call, Transcript, Understanding, ProjectBrief,
                   Workshop, Synthesis, Proposal, Quote, Approval
  briefs/          Briefs across projects
  meetings/        Meetings across projects
  intelligence/    AI understanding across projects
  workshops/       Workshops across projects
  proposals/       Proposals across projects
  quotes/          Quotes across projects
  approvals/       Human + AI approval center
components/app/    Header, Footer, WorkflowRail, UI primitives, Page
lib/               types, store, utils, AI integration
```

---

## Design philosophy

- Strong typography, excellent whitespace, refined borders, subtle shadows.
- Clear **AI vs Human** distinction throughout (slate-blue for AI, grounded green for human).
- No neon gradients, no glowing cards, no fake statistics — purposeful information hierarchy only.
