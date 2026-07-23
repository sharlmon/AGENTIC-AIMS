import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, deliverables: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      deliverables: project.deliverables || [],
    })
  } catch (error) {
    console.error("Failed to fetch deliverables:", error)
    return NextResponse.json({ error: "Failed to load deliverables" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { deliverables } = body || {}

    if (!Array.isArray(deliverables)) {
      return NextResponse.json({ error: "Deliverables must be an array" }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { deliverables },
      select: { id: true, name: true, deliverables: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update deliverables:", error)
    return NextResponse.json({ error: "Failed to update deliverables" }, { status: 500 })
  }
}
