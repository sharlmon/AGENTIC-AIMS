"use client"

import { useState, useEffect } from "react"
import { PageHead } from "@/components/app/Page"

const ROLES = [
  { value: "strategist", label: "Strategist" },
  { value: "creative", label: "Creative" },
  { value: "producer", label: "Producer" },
  { value: "lead", label: "Lead (Admin)" },
]

type User = {
  id: string
  name: string
  email: string
  role: string
  projects: any[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])

  const updateRole = async (userId: string, newRole: string) => {
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  if (loading) {
    return (
      <div className="admin-content">
        <PageHead eyebrow="Admin" title="Users" desc="Manage user accounts and roles." />
        <div className="admin-section">
          <p style={{ color: "#8e8e93" }}>Loading users…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Users" desc="Manage user accounts and roles." />

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table responsive-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Projects</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">
                    <span style={{ fontWeight: 600, color: "#1b1a17" }}>{u.name}</span>
                  </td>
                  <td data-label="Email" className="admin-table-muted">{u.email}</td>
                  <td data-label="Role">
                    <select
                      className="admin-input"
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      style={{ width: "auto", padding: "4px 8px", fontSize: "0.82rem" }}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Projects" className="admin-table-muted">{(u.projects?.length || 0)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-table-empty">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
