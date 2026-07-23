export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead } from "@/components/app/Page"
import { CareersManager } from "@/components/app/CareersManager"

export default async function AdminCareersPage() {
  const rawCareers = await prisma.career.findMany({
    orderBy: { createdAt: "desc" },
  })
  const careers = rawCareers.map((c) => ({
    ...c,
    publishedAt: c.publishedAt ? c.publishedAt.toISOString() : undefined,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Careers" desc="Manage job postings and career opportunities." />
      <CareersManager initialCareers={careers as any} />
    </div>
  )
}
