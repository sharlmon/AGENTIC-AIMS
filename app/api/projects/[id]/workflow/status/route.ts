export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      brief: true,
      call: true,
      contactReport: true,
      productionMeeting: true,
      proposal: true,
      quote: true,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      stage: project.stage,
      progress: project.progress,
      nextAction: project.nextAction,
      aiWorkflowStatus: project.aiWorkflowStatus,
    },
  })
}
