import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { runAutoWorkflow } from "@/lib/auto-workflow"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const result = await runAutoWorkflow(params.id)

    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: "AI workflow completed",
        message: `AI workflow for "${project.name}" finished. Stage: ${result.stage || "unknown"}`,
        kind: "system",
        refId: project.id,
      })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Manual workflow trigger error:", error)
    return NextResponse.json({ error: "Failed to trigger workflow" }, { status: 500 })
  }
}
