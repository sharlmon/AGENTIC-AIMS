export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch team members:", error)
    return NextResponse.json({ error: "Failed to load team members" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        skills: body.skills || [],
        availability: body.availability || "available",
        avatar: body.avatar,
        description: body.description,
        calendarJson: body.calendarJson,
        notes: body.notes,
      },
    })
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Failed to create team member:", error)
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 })
  }
}
