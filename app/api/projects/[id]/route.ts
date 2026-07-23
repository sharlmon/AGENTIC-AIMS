import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: projectId },
          { roomName: projectId },
        ],
      },
      include: {
        proposals: { orderBy: { createdAt: "desc" } },
        meetings: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch project details." },
      { status: 500 }
    );
  }
}
