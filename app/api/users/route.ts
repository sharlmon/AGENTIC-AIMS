export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (!adminIds.includes(userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { projects: true },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}
