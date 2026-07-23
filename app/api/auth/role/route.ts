import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ role: null })

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)

  const email = clerkUser?.email_addresses?.[0]?.email_address || null

  if (!email) return NextResponse.json({ role: "strategist" })

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  })

  return NextResponse.json({ role: user?.role || "strategist" })
}
