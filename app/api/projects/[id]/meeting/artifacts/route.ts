export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { artifact, meetingSource, transcript } = body

    if (!artifact?.url) {
      return NextResponse.json({ error: "Artifact URL is required" }, { status: 400 })
    }

    const call = await prisma.clientCall.findUnique({ where: { projectId: params.id } })
    if (!call) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const artifacts = (call.artifacts as any[]) || []
    artifacts.push({
      name: artifact.name || "Uploaded file",
      url: artifact.url,
      mimeType: artifact.mimeType,
      size: artifact.size,
      uploadedAt: new Date().toISOString(),
    })

    const updateData: any = { artifacts }
    if (meetingSource) updateData.meetingSource = meetingSource
    if (transcript !== undefined) updateData.transcript = transcript

    const updated = await prisma.clientCall.update({
      where: { projectId: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, call: updated })
  } catch (error) {
    console.error("Meeting artifact error:", error)
    return NextResponse.json({ error: "Failed to save artifact" }, { status: 500 })
  }
}
