import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with initial projects and proposals…");

  // Clean existing records to avoid unique constraint conflicts on roomName
  await prisma.invoice.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.project.deleteMany();

  const p1 = await prisma.project.create({
    data: {
      clientName: "Genesis Kenya",
      clientEmail: "team@genesis.co.ke",
      name: "Moringa Hackathon launch",
      roomName: "moringa-hackathon-launch-ab12cd34",
      serviceLine: "Custom Web Application",
      stage: "ready_for_dispatch",
      status: "active",
      discoveryNotes: "Client requires high-scale event registration portal with real-time leaderboard and automated email notifications.",
      fathomNotes: "Confirmed timeline is 3 weeks. Stakeholder approval pending final proposal budget review.",
      proposals: {
        create: {
          title: "Proposal · Moringa Hackathon Launch Platform",
          content: `<h1>Proposal for Genesis Kenya</h1>
<p>Complete execution plan for the Moringa Hackathon Launch platform.</p>
<h2>Scope & Deliverables</h2>
<ul>
  <li>Next.js & Tailwind CSS high-performance web app</li>
  <li>Real-time database and Leaderboard architecture</li>
  <li>Automated participant email onboarding</li>
</ul>
<h2>Execution Timeline</h2>
<p>3 weeks from contract signing to production deployment.</p>`,
          status: "approved",
          recipientEmail: "team@genesis.co.ke",
          confidenceScore: 95,
          iterations: 2,
          metaAuditNotes: "Passed all scope and requirement checks with >90% confidence score.",
          approvedAt: new Date(),
        },
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      clientName: "Apeiron Systems",
      clientEmail: "tech@apeiron.com",
      name: "Global Payment Engine Migration",
      roomName: "global-payment-engine-migration-ef56gh78",
      serviceLine: "Fintech Infrastructure",
      stage: "delivered",
      status: "active",
      discoveryNotes: "Migrate legacy payment processing infrastructure to modern serverless API microservices with 99.99% SLA.",
      fathomNotes: "Architectural alignment meeting complete. API contract defined.",
      proposals: {
        create: {
          title: "Proposal · Global Payment Engine Modernization",
          content: `<h1>Payment Engine Modernization for Apeiron Systems</h1>
<h2>Executive Summary</h2>
<p>Seamless migration strategy to zero-downtime microservices with robust audit logging.</p>
<h2>Architecture Blueprint</h2>
<ul>
  <li>Stripe & Local Payment Gateway integration</li>
  <li>Idempotent webhook transaction processor</li>
  <li>PCI-DSS compliant data encryption</li>
</ul>`,
          status: "dispatched",
          recipientEmail: "tech@apeiron.com",
          confidenceScore: 98,
          iterations: 1,
          metaAuditNotes: "Exceeds security and architectural benchmarks.",
          approvedAt: new Date(Date.now() - 86400000),
          dispatchedAt: new Date(Date.now() - 43200000),
        },
      },
    },
  });

  const p3 = await prisma.project.create({
    data: {
      clientName: "Nairobi Logistics",
      clientEmail: "ops@nairobilogistics.com",
      name: "AI Customer Support Portal",
      roomName: "ai-customer-support-portal-ij90kl12",
      serviceLine: "AI & Automation",
      stage: "discovery",
      status: "active",
      discoveryNotes: "Automate tier-1 customer inquiries with Gemini LLM integration and live human handoff.",
      fathomNotes: "Initial discovery call notes captured.",
      proposals: {
        create: {
          title: "Proposal · AI Support Portal Implementation",
          content: `<h1>AI Support Portal for Nairobi Logistics</h1>
<p>Automate 70% of inbound customer queries using customized Gemini workflows.</p>
<h2>Key Capabilities</h2>
<ul>
  <li>Intelligent intent classification</li>
  <li>Real-time ticket routing and escalation</li>
  <li>CRM & ERP data sync</li>
</ul>`,
          status: "draft",
          recipientEmail: "ops@nairobilogistics.com",
          confidenceScore: 88,
          iterations: 3,
          metaAuditNotes: "Requires client clarification on custom ERP integration endpoints before approval gate.",
        },
      },
    },
  });

  console.log("✅ Database seeding complete! Seeded 3 projects and proposals.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
