import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function clearData() {
  console.log("🧹 Clearing all mock data from database...")

  try {
    await prisma.approval.deleteMany()
    await prisma.quote.deleteMany()
    await prisma.proposal.deleteMany()
    await prisma.synthesis.deleteMany()
    await prisma.workshopInsight.deleteMany()
    await prisma.workshop.deleteMany()
    await prisma.projectBrief.deleteMany()
    await prisma.understanding.deleteMany()
    await prisma.transcript.deleteMany()
    await prisma.contactReport.deleteMany()
    await prisma.productionMeeting.deleteMany()
    await prisma.clientCall.deleteMany()
    await prisma.brief.deleteMany()
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.project.deleteMany()
    await prisma.client.deleteMany()
    await prisma.talent.deleteMany()

    console.log("✨ All mock data successfully cleared! Database is 100% clean for testing.")
  } catch (err) {
    console.error("Error clearing database:", err)
    process.exit(1)
  }
}

clearData()
  .catch((e) => {
    console.error("Failed to clear database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
