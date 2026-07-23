import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const conversation = await prisma.conversation.findFirst({
    where: { projectId: params.projectId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  return NextResponse.json(conversation)
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const body = await req.json()
  const conversation = await prisma.conversation.create({
    data: {
      projectId: params.projectId,
      participants: body.participants || [],
      messages: {
        create: body.messages?.map((m: any) => ({
          senderId: m.senderId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          recipientId: m.recipientId,
          subject: m.subject,
          body: m.body,
          attachments: m.attachments || [],
          kind: m.kind || "message",
          refId: m.refId,
        })) || [],
      },
    },
    include: { messages: true },
  })
  return NextResponse.json(conversation, { status: 201 })
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
  const body = await req.json()
  const conversation = await prisma.conversation.upsert({
    where: { id: body.conversationId },
    update: {
      messages: {
        create: body.messages?.map((m: any) => ({
          senderId: m.senderId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          recipientId: m.recipientId,
          subject: m.subject,
          body: m.body,
          attachments: m.attachments || [],
          kind: m.kind || "message",
          refId: m.refId,
        })) || [],
      },
    },
    create: {
      projectId: params.projectId,
      participants: body.participants || [],
      messages: {
        create: body.messages?.map((m: any) => ({
          senderId: m.senderId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          recipientId: m.recipientId,
          subject: m.subject,
          body: m.body,
          attachments: m.attachments || [],
          kind: m.kind || "message",
          refId: m.refId,
        })) || [],
      },
    },
    include: { messages: true },
  })
  return NextResponse.json(conversation)
}
