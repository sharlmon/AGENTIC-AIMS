export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })
    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to fetch client:", error)
    return NextResponse.json({ error: "Failed to load client" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const client = await prisma.client.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to update client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.client.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete client:", error)
    return NextResponse.json({ error: "Failed to remove client" }, { status: 500 })
  }
}
