import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function roomSlug(projectName: string) {
  const base = projectName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "client-project";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  try {
    const { clientName, clientEmail, projectName } = await request.json();
    if (![clientName, clientEmail, projectName].every((value) => typeof value === "string" && value.trim())) {
      return NextResponse.json({ error: "clientName, clientEmail, and projectName are required." }, { status: 400 });
    }

    const roomName = roomSlug(projectName);
    const project = await prisma.project.create({
      data: {
        slug: roomName,
        name: projectName.trim(),
        client: clientName.trim(),
        type: "Brand & Campaign",
        nextAction: "Complete discovery call",
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        roomName,
        stage: "discovery",
        status: "active",
      },
    });

    // Updated redirect URL pointing to Phase 1 Client Discovery Node
    const redirectUrl = `/meeting/client/${project.id}`;

    return NextResponse.json(
      {
        projectId: project.id,
        roomName,
        redirectUrl,
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project initialization failed", error);
    return NextResponse.json({ error: "Unable to start the project." }, { status: 500 });
  }
}
