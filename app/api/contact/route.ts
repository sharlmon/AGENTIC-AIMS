import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        company: company || null,
        subject,
        message,
      },
    })

    return NextResponse.json({ ok: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
