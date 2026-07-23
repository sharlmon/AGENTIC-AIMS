import { AdminShell } from "@/components/app/AdminShell"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
  if (!adminIds.includes(userId)) redirect("/dashboard/overview")

  return <AdminShell>{children}</AdminShell>
}
