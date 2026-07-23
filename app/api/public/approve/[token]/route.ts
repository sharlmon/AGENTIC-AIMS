import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { proposalApprovedEmail, quoteApprovedEmail, adminProjectApprovedEmail } from "@/lib/email-templates"

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const proposal = await prisma.proposal.findUnique({ where: { publicToken: params.token } })
  if (proposal) {
    return NextResponse.json({ type: "proposal", data: proposal })
  }

  const quote = await prisma.quote.findUnique({ where: { publicToken: params.token } })
  if (quote) {
    return NextResponse.json({ type: "quote", data: quote })
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = body?.action as string | undefined
    const feedback = body?.feedback as string | undefined
    const suggestions = body?.suggestions as { budget?: string; timeline?: string; scope?: string } | undefined

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const proposal = await prisma.proposal.findUnique({ where: { publicToken: params.token } })
    if (proposal) {
      const status = action === "approve" ? "approved" : "rejected"
      const updated = await prisma.proposal.update({
        where: { publicToken: params.token },
        data: { status: status as any },
      })

      if (feedback || suggestions) {
        const project = await prisma.project.findUnique({
          where: { id: proposal.projectId },
          include: { owner: true },
        })

        await prisma.approval.create({
          data: {
            projectId: proposal.projectId,
            kind: "proposal",
            title: `Client feedback on proposal: ${project?.name || ""}`,
            note: feedback || "Client requested changes without specific feedback.",
            status: "rejected",
            decidedBy: "client",
          },
        })

        if (project?.ownerId) {
          let feedbackText = feedback || "Client requested changes."
          if (suggestions) {
            if (suggestions.budget) feedbackText += `\n\nBudget suggestion: ${suggestions.budget}`
            if (suggestions.timeline) feedbackText += `\n\nTimeline suggestion: ${suggestions.timeline}`
            if (suggestions.scope) feedbackText += `\n\nScope suggestion: ${suggestions.scope}`
          }
          await sendNotification({
            userId: project.ownerId,
            title: "Client requested changes to proposal",
            message: `Client wants revisions on "${project.name}".\n\n${feedbackText}`,
            kind: "message",
            refId: project.id,
          })
        }
      }

      if (action === "approve") {
        const project = await prisma.project.findUnique({
          where: { id: proposal.projectId },
          include: { owner: true, clientRef: true },
        })

        if (project) {
          const quote = await prisma.quote.findUnique({ where: { projectId: project.id } })
          const bothApproved = quote?.status === "approved"

          if (project.ownerId) {
            await sendNotification({
              userId: project.ownerId,
              title: "Proposal approved by client",
              message: `Client approved the proposal for "${project.name}".${bothApproved ? " Quote also approved — project ready to begin." : ""}`,
              kind: "message",
              refId: project.id,
            })
          }

          if (project.clientRef?.email) {
            await sendEmail({
              to: project.clientRef.email,
              subject: `Proposal approved: ${project.name}`,
              html: proposalApprovedEmail({ clientName: project.clientRef.name || project.client, projectName: project.name, bothApproved }),
            })
          }

          if (bothApproved) {
            await prisma.project.update({
              where: { id: project.id },
              data: { stage: "approval", nextAction: "Final approval — project ready to begin", status: "complete", progress: 100 },
            })

             if (project.ownerId) {
               await sendNotification({
                 userId: project.ownerId,
                 title: "Project approved!",
                 message: `"${project.name}" has been fully approved by the client. You can now begin production.`,
                 kind: "system",
                 refId: project.id,
               })
             }

            const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
            for (const adminId of adminIds) {
              if (adminId !== project.ownerId) {
                const adminUser = await prisma.user.findUnique({ where: { id: adminId } })
                if (adminUser?.email) {
                  await sendEmail({
                    to: adminUser.email,
                    subject: `Project approved: ${project.name}`,
                    html: adminProjectApprovedEmail({ projectName: project.name }),
                  })
                }
              }
            }
          }
        }
      }

      return NextResponse.json({ type: "proposal", data: updated })
    }

    const quote = await prisma.quote.findUnique({ where: { publicToken: params.token } })
    if (quote) {
      const status = action === "approve" ? "approved" : "rejected"
      const updated = await prisma.quote.update({
        where: { publicToken: params.token },
        data: { status: status as any },
      })

      if (feedback || suggestions) {
        const project = await prisma.project.findUnique({
          where: { id: quote.projectId },
          include: { owner: true },
        })

        await prisma.approval.create({
          data: {
            projectId: quote.projectId,
            kind: "quote",
            title: `Client feedback on quote: ${project?.name || ""}`,
            note: feedback || "Client requested changes without specific feedback.",
            status: "rejected",
            decidedBy: "client",
          },
        })

        if (project?.ownerId) {
          let feedbackText = feedback || "Client requested changes."
          if (suggestions) {
            if (suggestions.budget) feedbackText += `\n\nBudget suggestion: ${suggestions.budget}`
            if (suggestions.timeline) feedbackText += `\n\nTimeline suggestion: ${suggestions.timeline}`
            if (suggestions.scope) feedbackText += `\n\nScope suggestion: ${suggestions.scope}`
          }
          await sendNotification({
            userId: project.ownerId,
            title: "Client requested changes to quote",
            message: `Client wants revisions on "${project.name}".\n\n${feedbackText}`,
            kind: "message",
            refId: project.id,
          })
        }
      }

      if (action === "approve") {
        const project = await prisma.project.findUnique({
          where: { id: quote.projectId },
          include: { owner: true, clientRef: true },
        })

        if (project) {
          const proposal = await prisma.proposal.findUnique({ where: { projectId: project.id } })
          const proposalApproved = proposal?.status === "approved"

          await prisma.project.update({
            where: { id: project.id },
            data: { stage: "approval", nextAction: "Final approval — project ready to begin" },
          })

          if (project.ownerId) {
            await sendNotification({
              userId: project.ownerId,
              title: "Quote approved — project ready!",
              message: `Client approved the quote for "${project.name}".${proposalApproved ? " Proposal also approved — project ready to begin." : ""}`,
              kind: "system",
              refId: project.id,
            })
          }

          if (project.clientRef?.email) {
            await sendEmail({
              to: project.clientRef.email,
              subject: `Quote approved: ${project.name}`,
              html: quoteApprovedEmail({ clientName: project.clientRef.name || project.client, projectName: project.name, proposalApproved }),
            })
          }

          if (proposalApproved) {
            await prisma.project.update({
              where: { id: project.id },
              data: { status: "complete", progress: 100 },
            })

            const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
            for (const adminId of adminIds) {
              if (adminId !== project.ownerId) {
                const adminUser = await prisma.user.findUnique({ where: { id: adminId } })
                if (adminUser?.email) {
                  await sendEmail({
                    to: adminUser.email,
                    subject: `Project approved: ${project.name}`,
                    html: adminProjectApprovedEmail({ projectName: project.name }),
                  })
                }
              }
            }
          }
        }
      }

      return NextResponse.json({ type: "quote", data: updated })
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}
