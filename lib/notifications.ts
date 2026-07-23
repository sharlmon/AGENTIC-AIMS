import { prisma } from "@/lib/prisma"

export async function sendNotification(params: {
  userId?: string
  userIds?: string[]
  title: string
  message: string
  kind?: string
  refId?: string
}) {
  const userIds = params.userIds || (params.userId ? [params.userId] : [])
  if (userIds.length === 0) return

  await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      title: params.title,
      message: params.message,
      kind: params.kind || "info",
      refId: params.refId,
    })),
  })
}

export async function notifyAdmins(params: {
  title: string
  message: string
  kind?: string
  refId?: string
}) {
  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (adminIds.length === 0) return

  await prisma.notification.createMany({
    data: adminIds.map(userId => ({
      userId,
      title: params.title,
      message: params.message,
      kind: params.kind || "info",
      refId: params.refId,
    })),
  })
}
