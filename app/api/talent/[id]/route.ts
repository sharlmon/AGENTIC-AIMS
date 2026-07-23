export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const talent = await prisma.talent.findUnique({ where: { id: params.id } })
    if (!talent) return NextResponse.json({ error: "Talent not found" }, { status: 404 })
    return NextResponse.json(talent)
  } catch (error) {
    console.error("Failed to fetch talent:", error)
    return NextResponse.json({ error: "Failed to load talent" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const talent = await prisma.talent.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(talent)
  } catch (error) {
    console.error("Failed to update talent:", error)
    return NextResponse.json({ error: "Failed to update talent" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.talent.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete talent:", error)
    return NextResponse.json({ error: "Failed to remove talent" }, { status: 500 })
  }
}
