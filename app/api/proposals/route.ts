import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const records = await prisma.proposal.findMany({
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const proposals = records.map((item) => ({
      id: item.id,
      projectId: item.projectId,
      type: item.type,
      client: item.project?.clientName || "Client Project",
      clientEmail: item.project?.clientEmail || item.recipientEmail,
      serviceLine: item.project?.serviceLine || "Agency Service",
      title: item.title,
      content: item.content,
      status: item.status,
      stage: item.project?.stage || "discovery",
      projectStatus: item.project?.status || "active",
      recipientEmail: item.recipientEmail,
      confidenceScore: item.confidenceScore,
      iterations: item.iterations,
      metaAuditNotes: item.metaAuditNotes,
      approvedAt: item.approvedAt ? item.approvedAt.toISOString() : null,
      dispatchedAt: item.dispatchedAt ? item.dispatchedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      discoveryNotes: item.project?.discoveryNotes || null,
      fathomNotes: item.project?.fathomNotes || null,
    }));

    return NextResponse.json({ proposals });
  } catch (error: any) {
    console.error("GET /api/proposals error:", error);
    return NextResponse.json(
      { error: "Unable to fetch proposal records.", proposals: [] },
      { status: 500 }
    );
  }
}
