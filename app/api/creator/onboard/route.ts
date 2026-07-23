import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateWithGemini } from "@/lib/ai"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, role, bio, portfolio, rate } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Please provide your name and email." }, { status: 400 })
    }

    const prompt = `You are a talent evaluation AI for Synthos Creator Network. Analyze this creator/developer introduction:
Name: ${name}
Email: ${email}
Stated Role: ${role || "Software Developer"}
Bio / Background: ${bio || "Software engineer specializing in modern web apps"}
Portfolio: ${portfolio || "N/A"}

Extract a structured JSON response (no markdown, no code fences):
{
  "primaryRole": "Full-Stack Web Developer",
  "skills": ["Next.js", "React", "TypeScript", "Node.js", "UI/UX Design"],
  "yearsExperience": 4,
  "capabilitiesSummary": "Specializes in building modern web applications, scalable frontend interfaces, and clean API integrations.",
  "recommendedTier": "Lead Developer"
}`

    let enriched = {
      primaryRole: role || "Developer / Agency Lead",
      skills: ["Software Engineering", "Web Development", "UI/UX Design"],
      yearsExperience: 4,
      capabilitiesSummary: bio || "Experienced developer and creator building modern web platforms.",
      recommendedTier: "Creator Lead",
    }

    try {
      const raw = await generateWithGemini(prompt)
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      enriched = { ...enriched, ...parsed }
    } catch (e) {
      console.warn("Gemini creator enrichment fallback:", e)
    }

    const yearsExp = typeof enriched.yearsExperience === "number" && !isNaN(enriched.yearsExperience) ? enriched.yearsExperience : 4

    // 1. Create or update User in Prisma
    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CR"
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role: "lead" },
      create: {
        email,
        name,
        initials,
        role: "lead",
      },
    })

    // 2. Create or update Talent record in Prisma
    const existingTalent = await prisma.talent.findFirst({ where: { email } })
    const talent = existingTalent
      ? await prisma.talent.update({
          where: { id: existingTalent.id },
          data: {
            name,
            role: enriched.primaryRole,
            skills: enriched.skills,
            experience: yearsExp,
            rate: rate || "$100/hr",
            portfolio: portfolio || "",
            notes: enriched.capabilitiesSummary,
            availability: "available",
          },
        })
      : await prisma.talent.create({
          data: {
            name,
            email,
            role: enriched.primaryRole,
            skills: enriched.skills,
            experience: yearsExp,
            rating: 5.0,
            availability: "available",
            rate: rate || "$100/hr",
            portfolio: portfolio || "",
            notes: enriched.capabilitiesSummary,
          },
        })

    // 3. Send tailored Creator Onboarding Email via Resend API
    const htmlEmail = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #fafafa; padding: 40px; border-radius: 16px;">
        <div style="max-width: 565px; margin: 0 auto; background-color: #121215; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #818cf8; display: block; margin-bottom: 12px;">
            Synthos Creator Network
          </span>
          <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px;">
            Welcome to the Workspace, ${name}!
          </h2>
          <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Your profile as a <strong>${enriched.primaryRole}</strong> has been verified and registered on Synthos.
          </p>

          <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #34d399; display: block; margin-bottom: 8px;">
              ✓ AI Verified Capabilities
            </span>
            <p style="font-size: 14px; color: #e4e4e7; margin: 0 0 12px; line-height: 1.6;">
              ${enriched.capabilitiesSummary}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${(enriched.skills || []).map((s: string) => `<span style="background: rgba(129, 140, 248, 0.15); color: #818cf8; border: 1px solid rgba(129, 140, 248, 0.3); font-size: 12px; padding: 3px 10px; border-radius: 100px;">${s}</span>`).join(" ")}
            </div>
          </div>

          <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 28px;">
            You can now review incoming client briefs, manage AI proposal synthesis, track active project workflows, and collaborate with team members.
          </p>

          <a href="http://localhost:3001/dashboard/overview" style="display: inline-block; background-color: #ffffff; color: #09090b; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
            Open Creator Workspace →
          </a>
        </div>
      </div>
    `

    sendEmail({
      to: email,
      subject: `Welcome to Synthos Creator Network, ${name}!`,
      html: htmlEmail,
    }).catch((err) => console.error("Failed to send creator welcome email:", err))

    return NextResponse.json({
      success: true,
      user,
      talent,
      enrichedData: enriched,
    }, { status: 201 })
  } catch (error) {
    console.error("Creator onboarding error:", error)
    return NextResponse.json({ error: "Failed to process creator onboarding" }, { status: 500 })
  }
}
