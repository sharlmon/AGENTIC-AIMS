import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { roomName: string } }
) {
  try {
    const roomName = decodeURIComponent(params.roomName);
    if (!roomName) {
      return NextResponse.json({ error: "roomName is required." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { roomName },
      select: { id: true, clientName: true, clientEmail: true, name: true, roomName: true, stage: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found for this room." }, { status: 404 });
    }

    return NextResponse.json({ projectId: project.id, project });
  } catch (error) {
    console.error("Project lookup by room failed", error);
    return NextResponse.json({ error: "Unable to find project." }, { status: 500 });
  }
}
