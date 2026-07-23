import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST as synthesizeProposal } from "@/app/api/agents/synthesize/route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { projectId, roomName, mockTranscript } = body;

    const transcriptContent =
      mockTranscript ||
      `[0:15] Executive Client Sync
Client confirmed key requirements: High-scale automated portal with real-time analytics.
Timeline target: 3 weeks. Budget: Pending formal quotation.`;

    let project = null;

    if (projectId) {
      project = await prisma.project.findUnique({ where: { id: projectId } });
    }

    if (!project && roomName) {
      project = await prisma.project.findFirst({
        where: { roomName: roomName },
      });
    }

    if (!project) {
      // Fallback: get latest active project
      project = await prisma.project.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!project) {
      return NextResponse.json({ error: "No active project found to attach simulation transcript." }, { status: 404 });
    }

    const discoveryNotes =
      project.discoveryNotes || "Client discovery meeting completed with initial requirements.";

    // 1. Attach transcript to Project and advance stage to 'understanding'
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        fathomNotes: transcriptContent,
        stage: "internal_sync",
      },
    });

    // 2. Auto-Trigger Synthesis pipeline
    const synthRequest = new Request("http://localhost/api/agents/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        discoveryNotes,
        transcript: transcriptContent,
        title: `Proposal · ${project.name}`,
      }),
    });

    const synthResponse = await synthesizeProposal(synthRequest);
    const synthResult = await synthResponse.json();

    return NextResponse.json({
      success: true,
      message: "Simulated call transcript attached and proposal synthesized successfully.",
      project: updatedProject,
      proposal: synthResult.proposal,
      readyForApproval: synthResult.readyForApproval,
    });
  } catch (error: any) {
    console.error("Call simulation route failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to simulate call ingestion." },
      { status: 500 }
    );
  }
}
