export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead } from "@/components/app/Page"

export default async function AdminMessagesPage() {
  const conversations = await prisma.conversation.findMany({
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Messages" desc="Client communications and sent proposals/quotes." />
      {conversations.length === 0 ? (
        <div className="admin-section" style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "#8e8e93" }}>No conversations yet. Messages will appear here after meetings.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table responsive-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Participants</th>
                <th>Last Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv: any) => {
                const lastMsg = conv.messages[conv.messages.length - 1]
                const project = conv.project
                return (
                  <tr key={conv.id}>
                    <td data-label="Project">
                      <span style={{ fontWeight: 600, color: "#1b1a17" }}>{project?.name || "Unknown"}</span>
                    </td>
                    <td data-label="Participants" className="admin-table-muted">{(conv.participants || []).join(", ")}</td>
                    <td data-label="Last Message">
                      <span className="chip">{lastMsg?.subject || lastMsg?.kind || "Message"}</span>
                    </td>
                    <td data-label="Date" className="admin-table-muted">{lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
