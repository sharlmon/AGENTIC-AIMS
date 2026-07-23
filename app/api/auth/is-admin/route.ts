import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ isAdmin: false })

  // Any signed-in user is granted creator/admin access to Dashboard & Mission Control
  return NextResponse.json({ isAdmin: true })
}
