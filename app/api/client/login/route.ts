export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json({ user: user || null })
  } catch (error) {
    console.error("Failed to get client session:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
