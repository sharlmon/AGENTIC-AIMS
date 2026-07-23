"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserPlus, Briefcase, MessageSquare, Settings, Newspaper, FileText, ArrowLeft, Menu, X, FolderOpen, UserSearch, Contact } from "lucide-react"
import "./admin.css"

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/talent", label: "Talent", icon: UserSearch },
  { href: "/admin/clients", label: "Clients", icon: Contact },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/team", label: "Team", icon: UserPlus },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/contact-reports", label: "Contact Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn("admin-sidebar", sidebarOpen && "admin-sidebar--open")}>
        <div className="admin-sidebar-head">
          <Link href="/" className="admin-brand" onClick={() => setSidebarOpen(false)}>
            <span className="admin-brand-mark" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 17 L9 6 L13 13 L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="19" cy="4" r="2.1" fill="currentColor" />
              </svg>
            </span>
            <span className="admin-brand-word">
              Admin
              <em>Control Panel</em>
            </span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={cn("admin-nav-item", active && "admin-nav-item--active")} onClick={() => setSidebarOpen(false)}>
                <Icon size={18} strokeWidth={1.8} />
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/dashboard/overview" className="admin-back" onClick={() => setSidebarOpen(false)}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        {children}
      </main>
    </div>
  )
}
