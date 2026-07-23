export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead } from "@/components/app/Page"
import { TeamManager } from "@/components/app/TeamManager"

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Team" desc="Manage team members, roles, and availability for scheduling." />
      <TeamManager initialMembers={members as any} />
    </div>
  )
}
