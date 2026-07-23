export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  const { projectId, group, id: insightId, text, status } = await req.json()
  const insight = await prisma.insight.update({
    where: { id: insightId },
    data: { ...(text !== undefined ? { text } : {}), ...(status ? { status: status as any } : {}) },
  })
  return NextResponse.json(insight)
}
