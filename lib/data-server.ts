import { prisma } from "@/lib/prisma"

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { brief: true, understanding: { include: { insights: true } }, workshop: { include: { insights: true } }, proposal: true, quote: true, call: true, transcript: true, approvals: true },
  })
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      brief: true, call: true, transcript: true,
      understanding: { include: { insights: { orderBy: { createdAt: "asc" } } } },
      projectBrief: true,
      workshop: { include: { insights: { orderBy: { createdAt: "asc" } } } },
      synthesis: true, proposal: true, quote: true,
      approvals: { orderBy: { createdAt: "desc" } },
    },
  })
}
