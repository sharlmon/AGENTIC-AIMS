import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const TEMPLATES = [
  {
    id: "brand-campaign",
    name: "Brand & Campaign",
    data: {
      clientDetails: "Full-service brand campaign",
      overview: "A comprehensive brand campaign designed to elevate your market presence and connect with your target audience through strategic creative execution.",
      problem: "Your brand needs a cohesive campaign that cuts through the noise and drives measurable engagement.",
      solution: "We develop integrated campaigns spanning visual identity, messaging, and multi-channel execution.",
      scope: ["Brand strategy", "Visual identity", "Campaign messaging", "Asset production", "Channel rollout"],
      deliverables: ["Brand guidelines", "Campaign assets", "Social media kit", "Print/digital assets"],
      timeline: "8-12 weeks",
      team: ["Creative Director", "Strategist", "Designer", "Copywriter"],
      investment: "$35,000 - $75,000",
      terms: "40% start, 30% midpoint, 30% on delivery",
      sections: [
        { title: "Context", body: "Based on your brief, we understand the need for a brand campaign that resonates with your audience and drives business results.", attr: "ai" },
        { title: "Approach", body: "We start with strategy, move to creative development, and deliver production-ready assets across all channels.", attr: "mixed" },
      ],
    },
  },
  {
    id: "film-motion",
    name: "Film & Motion",
    data: {
      clientDetails: "Film and motion production",
      overview: "High-impact film and motion content that captivates audiences and communicates your story with cinematic quality.",
      problem: "You need motion content that stands out in a crowded media landscape and delivers emotional impact.",
      solution: "End-to-end production from concept to final cut, including pre-production, filming, and post-production.",
      scope: ["Concept development", "Pre-production", "Principal photography", "Post-production", "Color grading & sound"],
      deliverables: ["Final video files", "Social cuts", "Raw footage archive", "Music licensing"],
      timeline: "6-10 weeks",
      team: ["Director", "Producer", "Cinematographer", "Editor", "Sound designer"],
      investment: "$50,000 - $150,000",
      terms: "30% start, 40% production, 30% on delivery",
      sections: [
        { title: "Context", body: "Motion content is the most powerful medium for emotional connection. We bring your vision to life with professional production values.", attr: "ai" },
        { title: "Approach", body: "From storyboard to final cut, we handle every detail of the production process with precision and creativity.", attr: "mixed" },
      ],
    },
  },
  {
    id: "web-product",
    name: "Web & Product",
    data: {
      clientDetails: "Web and product design",
      overview: "User-centered web and product design that combines beautiful aesthetics with intuitive functionality.",
      problem: "Your digital product needs to be both beautiful and functional, meeting user needs while achieving business goals.",
      solution: "We design and build digital products through research, prototyping, and iterative design processes.",
      scope: ["User research", "Information architecture", "UI/UX design", "Prototyping", "Design system"],
      deliverables: ["Interactive prototype", "Design system", "UI specifications", "User testing report"],
      timeline: "10-16 weeks",
      team: ["Product Designer", "UX Researcher", "UI Designer", "Design Technologist"],
      investment: "$40,000 - $120,000",
      terms: "35% start, 35% mid-project, 30% on delivery",
      sections: [
        { title: "Context", body: "Great digital products are built on deep user understanding. We combine research with design craft.", attr: "ai" },
        { title: "Approach", body: "Research-driven design process with iterative prototyping and continuous user validation.", attr: "mixed" },
      ],
    },
  },
  {
    id: "strategy-campaign",
    name: "Strategy & Campaign",
    data: {
      clientDetails: "Strategic campaign planning",
      overview: "Data-informed strategy and campaign planning that aligns your creative ambitions with measurable business outcomes.",
      problem: "You need a strategic foundation that ensures every creative decision drives toward clear business objectives.",
      solution: "We develop comprehensive strategies backed by research, audience insights, and clear measurement frameworks.",
      scope: ["Market research", "Audience analysis", "Strategic framework", "Campaign planning", "Measurement setup"],
      deliverables: ["Strategy document", "Campaign blueprint", "Audience personas", "KPI framework"],
      timeline: "4-8 weeks",
      team: ["Strategist", "Analyst", "Creative Lead", "Account Manager"],
      investment: "$20,000 - $50,000",
      terms: "50% start, 50% on delivery",
      sections: [
        { title: "Context", body: "Strategy is the foundation of every successful campaign. We ensure your creative investment is always purposeful.", attr: "ai" },
        { title: "Approach", body: "Research-first methodology combining market data, audience insights, and competitive analysis.", attr: "mixed" },
      ],
    },
  },
]

export async function GET() {
  return NextResponse.json({ templates: TEMPLATES })
}
