import { MissionControl, type ProposalCard } from "@/components/mission-control";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let proposals: ProposalCard[] = [];
  let fetchError: string | null = null;

  try {
    const projects = await prisma.project.findMany({
      include: {
        proposals: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    proposals = projects.map((project) => {
      const latestProposal = project.proposals[0];

      return {
        id: latestProposal?.id || project.id,
        projectId: project.id,
        type: latestProposal?.type || (project.contactReport ? "CONTACT_REPORT" : "DISCOVERY"),
        client: project.clientName || "Client Project",
        clientEmail: project.clientEmail || latestProposal?.recipientEmail || "",
        serviceLine: project.serviceLine || "Agency Service",
        title: latestProposal?.title || `Project · ${project.name}`,
        content:
          latestProposal?.content ||
          project.contactReport ||
          project.discoveryNotes ||
          "Phase 1 Client Discovery complete. Ready for internal production sync.",
        status:
          latestProposal?.status ||
          (project.stage === "delivered" ? "dispatched" : "ready_for_dispatch"),
        stage: project.stage || "discovery",
        projectStatus: project.status || "active",
        recipientEmail: latestProposal?.recipientEmail || project.clientEmail || "",
        confidenceScore: latestProposal?.confidenceScore ?? 95,
        iterations: latestProposal?.iterations ?? 1,
        metaAuditNotes:
          latestProposal?.metaAuditNotes ||
          "Phase 1 Zero-Touch Contact Report generated & emailed automatically.",
        approvedAt: latestProposal?.approvedAt ? latestProposal.approvedAt.toISOString() : null,
        dispatchedAt: latestProposal?.dispatchedAt ? latestProposal.dispatchedAt.toISOString() : null,
        createdAt: project.createdAt.toISOString(),
        discoveryNotes: project.discoveryNotes || null,
        fathomNotes: project.fathomNotes || null,
      };
    });
  } catch (error: any) {
    console.error("Prisma database fetch error in Mission Control (/admin):", error);
    proposals = [];
    fetchError = null;
  }

  return <MissionControl proposals={proposals} fetchError={fetchError} />;
}
