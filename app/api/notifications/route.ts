export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unread = await prisma.notification.count({
    where: { userId, read: false },
  })

  return NextResponse.json({ notifications, unread })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const notification = await prisma.notification.create({
    data: {
      userId,
      title: body.title,
      message: body.message,
      kind: body.kind || "info",
      refId: body.refId,
    },
  })

  return NextResponse.json(notification, { status: 201 })
}
