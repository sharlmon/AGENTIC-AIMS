import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, clerkId } = body || {}

    if (!name?.trim() || !email?.trim() || !clerkId) {
      return NextResponse.json({ error: "Name, email, and Clerk ID are required." }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() },
    })

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        initials: initials || "CL",
        role: "client",
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role }, { status: 201 })
  } catch (error) {
    console.error("Failed to create client:", error)
    return NextResponse.json({ error: "Failed to create client account" }, { status: 500 })
  }
}
