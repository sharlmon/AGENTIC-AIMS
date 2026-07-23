import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST as runContactReport } from "@/app/api/agents/contact-report/route";
import { POST as runProposalSynthesis } from "@/app/api/agents/proposal/route";

export const runtime = "nodejs";

type FathomWebhookPayload = {
  meeting_id?: string;
  meetingId?: string;
  id?: string;
  title?: string;
  name?: string;
  room_name?: string;
  roomName?: string;
  summary?: string;
  transcript?: any;
  transcript_segments?: any;
  call?: {
    meeting_id?: string;
    room_name?: string;
    summary?: string;
    transcript?: any;
    attendees?: Array<any>;
    recorded_by?: { email?: string };
  };
  recorded_by?: { email?: string };
  attendees?: Array<any>;
  participants?: Array<any>;
  projectReference?: string;
  projectId?: string;
  url?: string;
  default_meeting_url?: string;
};

/**
 * Robust helper to extract full formatted transcript text from Fathom payload structures.
 * Formats transcript array items into: "Speaker Name: Transcript text..."
 */
function parseFathomTranscript(payload: any): string {
  const rawTranscript =
    payload.transcript ||
    payload.transcript_segments ||
    payload.call?.transcript ||
    payload.call?.transcript_segments;

  if (typeof rawTranscript === "string" && rawTranscript.trim()) {
    return rawTranscript.trim();
  }

  if (Array.isArray(rawTranscript)) {
    const formattedTranscript = rawTranscript
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";

        let speakerName = "Speaker";

        if (item.speaker) {
          if (typeof item.speaker === "string") {
            speakerName = item.speaker;
          } else if (typeof item.speaker === "object") {
            speakerName =
              item.speaker.display_name ||
              item.speaker.name ||
              item.speaker.matched_calendar_invitee_email ||
              "Speaker";
          }
        } else if (item.user) {
          if (typeof item.user === "string") {
            speakerName = item.user;
          } else if (typeof item.user === "object") {
            speakerName = item.user.display_name || item.user.name || "Speaker";
          }
        }

        const textContent = item.text || item.words || item.transcript || "";
        return `${speakerName}: ${textContent}`.trim();
      })
      .filter(Boolean)
      .join("\n\n");

    if (formattedTranscript.trim()) {
      return formattedTranscript;
    }
  }

  if (typeof payload.summary === "string" && payload.summary.trim()) {
    return payload.summary.trim();
  }
  if (payload.call && typeof payload.call.summary === "string" && payload.call.summary.trim()) {
    return payload.call.summary.trim();
  }
  return "";
}

/**
 * Robust helper to extract meeting summary from Fathom payload.
 */
function parseFathomSummary(payload: FathomWebhookPayload): string {
  if (typeof payload.summary === "string" && payload.summary.trim()) {
    return payload.summary.trim();
  }
  if (payload.call && typeof payload.call.summary === "string" && payload.call.summary.trim()) {
    return payload.call.summary.trim();
  }
  return "Fathom AI executive meeting summary.";
}

/**
 * Helper to extract attendee email list from various Fathom payload formats.
 */
function parseAttendeeEmails(payload: FathomWebhookPayload): string[] {
  const emails: string[] = [];
  const rawList = [
    ...(Array.isArray(payload.attendees) ? payload.attendees : []),
    ...(Array.isArray(payload.call?.attendees) ? payload.call.attendees : []),
    ...(Array.isArray(payload.participants) ? payload.participants : []),
  ];

  if (payload.recorded_by?.email) emails.push(payload.recorded_by.email.toLowerCase().trim());
  if (payload.call?.recorded_by?.email) emails.push(payload.call.recorded_by.email.toLowerCase().trim());

  rawList.forEach((item) => {
    if (typeof item === "string" && item.includes("@")) {
      emails.push(item.toLowerCase().trim());
    } else if (item && typeof item === "object") {
      const email = item.email || item.matched_calendar_invitee_email || item.user?.email;
      if (typeof email === "string" && email.includes("@")) {
        emails.push(email.toLowerCase().trim());
      }
    }
  });

  return Array.from(new Set(emails));
}

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const urlProjectId =
      requestUrl.searchParams.get("projectId") ||
      requestUrl.searchParams.get("project_id") ||
      "";

    const payload: FathomWebhookPayload = await request.json().catch(() => ({}));
    console.log("🔥 FATHOM WEBHOOK RECEIVED:", JSON.stringify(payload, null, 2));

    // Extract core metadata
    const meetingId =
      payload.meeting_id || payload.meetingId || payload.id || payload.call?.meeting_id || "";
    const transcriptText = parseFathomTranscript(payload);
    const summaryText = parseFathomSummary(payload);
    const attendeeEmails = parseAttendeeEmails(payload);
    const projectRef = urlProjectId || payload.projectReference || payload.projectId || "";
    const roomName =
      payload.room_name ||
      payload.roomName ||
      payload.call?.room_name ||
      payload.title ||
      payload.name ||
      "";

    // 1. Precise Identity Matching Hierarchy
    let project = null;

    // Search Strategy A: URL or Body projectId / projectRef
    if (projectRef) {
      project = await prisma.project.findFirst({
        where: { OR: [{ id: projectRef }, { roomName: projectRef }] },
      });
    }

    // Search Strategy B: Room Name match
    if (!project && roomName) {
      project = await prisma.project.findFirst({
        where: { roomName: roomName },
      });
    }

    // Search Strategy C: Attendee Email match against clientEmail
    if (!project && attendeeEmails.length > 0) {
      project = await prisma.project.findFirst({
        where: { clientEmail: { in: attendeeEmails } },
      });
    }

    // Search Strategy D: Recent project currently waiting for client transcript
    if (!project) {
      project = await prisma.project.findFirst({
        where: { stage: "discovery" },
        orderBy: { createdAt: "desc" },
      });
    }

    // Search Strategy E: Fallback to latest project
    if (!project) {
      project = await prisma.project.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!project) {
      return NextResponse.json(
        { error: "No matching project record found in database for Fathom transcript." },
        { status: 404 }
      );
    }

    const currentStage = project.stage;

    // 2. Guaranteed Non-Empty Database Save
    const validTranscript =
      transcriptText.length > 10 ? transcriptText : project.clientTranscript || summaryText;

    if (currentStage === "discovery") {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          clientTranscript: validTranscript,
          fathomNotes: validTranscript,
          discoveryNotes: summaryText,
          contactReport: summaryHtmlTemplate(summaryText, project.clientName, project.name),
        },
      });
    } else if (currentStage === "internal_sync") {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          internalTranscript: validTranscript,
        },
      });
    } else {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          fathomNotes: validTranscript,
        },
      });
    }

    // 3. Asynchronously trigger AI Pipeline with exact project ID and valid transcript
    (async () => {
      try {
        if (currentStage === "discovery") {
          const contactReportReq = new Request("http://localhost/api/agents/contact-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.id,
              transcript: validTranscript,
              discoveryNotes: summaryText,
              title: "Executive Contact Report",
            }),
          });
          await runContactReport(contactReportReq);
        } else if (currentStage === "internal_sync") {
          const proposalReq = new Request("http://localhost/api/agents/proposal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.id,
              transcript: validTranscript,
              discoveryNotes: project.discoveryNotes || summaryText,
              title: `Proposal · ${project.name}`,
            }),
          });
          await runProposalSynthesis(proposalReq);
        }
      } catch (asyncErr) {
        console.error("Asynchronous AI Pipeline execution error:", asyncErr);
      }
    })();

    return NextResponse.json({
      success: true,
      message: "Fathom webhook processed and transcript saved to Prisma DB successfully.",
      projectId: project.id,
      meetingId,
      stage: currentStage,
      transcriptLength: validTranscript.length,
    });
  } catch (error: any) {
    console.error("Fathom webhook route handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to parse Fathom webhook." },
      { status: 500 }
    );
  }
}

function summaryHtmlTemplate(summary: string, clientName: string, projectName: string): string {
  return `<section>
<h1>Executive Contact Report · ${clientName}</h1>
<h2>Call Summary</h2>
<p>${summary}</p>
<h2>Project Baseline</h2>
<p>Meeting recorded via Google Meet and transcribed by Fathom AI for ${projectName}.</p>
</section>`;
}
