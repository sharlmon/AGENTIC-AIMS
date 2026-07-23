import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { proposalId, action = "archive" } = body;

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required." }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal record not found." }, { status: 404 });
    }

    if (action === "delete") {
      await prisma.proposal.delete({ where: { id: proposalId } });
      return NextResponse.json({ success: true, message: "Proposal deleted permanently." });
    }

    if (action === "restore") {
      await prisma.project.update({
        where: { id: proposal.projectId },
        data: { status: "active" },
      });
      return NextResponse.json({ success: true, message: "Proposal restored to active queue." });
    }

    // Default action: archive
    await prisma.project.update({
      where: { id: proposal.projectId },
      data: { status: "archived" },
    });

    return NextResponse.json({ success: true, message: "Proposal moved to archived state." });
  } catch (error: any) {
    console.error("Archive proposal route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process archive action." },
      { status: 500 }
    );
  }
}
