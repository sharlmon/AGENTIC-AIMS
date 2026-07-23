export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id: params.id } })
    if (!member) return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to fetch team member:", error)
    return NextResponse.json({ error: "Failed to load team member" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to update team member:", error)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.teamMember.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete team member:", error)
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 })
  }
}
