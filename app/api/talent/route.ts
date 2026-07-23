export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const talents = await prisma.talent.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(talents)
  } catch (error) {
    console.error("Failed to fetch talent:", error)
    return NextResponse.json({ error: "Failed to load talent" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const talent = await prisma.talent.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        skills: body.skills || [],
        experience: body.experience || 0,
        rating: body.rating || 0,
        availability: body.availability || "available",
        rate: body.rate || "",
        portfolio: body.portfolio,
        notes: body.notes,
      },
    })
    return NextResponse.json(talent, { status: 201 })
  } catch (error) {
    console.error("Failed to create talent:", error)
    return NextResponse.json({ error: "Failed to add talent" }, { status: 500 })
  }
}
