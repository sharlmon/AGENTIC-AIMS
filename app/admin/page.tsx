export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { PageHead } from "@/components/app/Page"
import { Empty } from "@/components/app/ui"

export default async function AdminOverviewPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { brief: true } })
  const users = await prisma.user.findMany()
  const totalProjects = projects.length
  const totalAI = projects.reduce((a, p) => a + (p.aiActivity || 0), 0)
  const needsAttention = projects.filter((p) => p.status === "attention" || p.status === "review").length
  const activeUsers = users.length

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Overview" desc="System-wide metrics and activity." />

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-label">Total projects</span>
          <span className="admin-stat-value">{totalProjects}</span>
          <span className="admin-stat-sub">across all clients</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Active users</span>
          <span className="admin-stat-value">{activeUsers}</span>
          <span className="admin-stat-sub">team members</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">AI activity</span>
          <span className="admin-stat-value">{totalAI}</span>
          <span className="admin-stat-sub">insights generated</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Needs attention</span>
          <span className="admin-stat-value">{needsAttention}</span>
          <span className="admin-stat-sub">review required</span>
        </div>
      </div>

      <div className="admin-section">
        <h3 className="admin-section-title">Recent projects</h3>
        <div className="admin-table-wrap">
          <table className="admin-table responsive-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map((p: any) => (
                <tr key={p.id}>
                  <td data-label="Project">
                    <span style={{ fontWeight: 600, color: "#1b1a17" }}>{p.name}</span>
                  </td>
                  <td data-label="Client" className="admin-table-muted">{p.client}</td>
                  <td data-label="Status">
                    <span className={`admin-badge admin-badge-${p.status}`}>{p.status}</span>
                  </td>
                  <td data-label="Progress" className="admin-table-muted">{p.progress || 0}%</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-table-empty">No projects yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
