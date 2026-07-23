import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { proposalId, content } = body;

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required." }, { status: 400 });
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        content: content || "",
      },
    });

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: "Proposal content updated successfully.",
    });
  } catch (error: any) {
    console.error("Update proposal error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update proposal content." },
      { status: 500 }
    );
  }
}
