export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (!adminIds.includes(userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      role: body.role,
    },
  })
  return NextResponse.json(user)
}
