export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message: msg } = body || {}

    if (!name?.trim() || !email?.trim() || !msg?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { publicToken: params.token },
      include: { clientRef: true, owner: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        projectId: project.id,
        participants: [email, ...(project.clientRef?.email ? [project.clientRef.email] : [])],
      },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: email,
        senderName: name.trim(),
        senderRole: "client",
        subject: subject?.trim() || `Re: ${project.name}`,
        body: msg.trim(),
        kind: "message",
      },
    })

    const emailSubject = subject?.trim() || `New message on ${project.name}`
    const emailHtml = `
      <p>You have a new message from <strong>${name.trim()}</strong> on project <strong>${project.name}</strong>.</p>
      <p><strong>Subject:</strong> ${emailSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${msg.trim()}</p>
      <hr />
      <p style="color: #888; font-size: 0.85rem;">Project: ${project.name}</p>
    `

    const recipients = new Set<string>()
    if (project.owner?.email) recipients.add(project.owner.email)

    const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map((id) => id.trim()).filter(Boolean)
    for (const adminId of adminIds) {
      const adminUser = await prisma.user.findUnique({ where: { id: adminId } })
      if (adminUser?.email) recipients.add(adminUser.email)
    }

    for (const recipientEmail of recipients) {
      await sendEmail({
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      })
    }

    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: `New message from ${name.trim()}`,
        message: `${emailSubject} — ${msg.trim().slice(0, 120)}`,
        kind: "message",
        refId: project.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
