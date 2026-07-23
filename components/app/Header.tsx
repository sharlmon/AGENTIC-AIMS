"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, UserButton } from "@clerk/nextjs"
import { Bell, X, Check, Users } from "lucide-react"
import { RoleSelectorModal } from "@/components/app/RoleSelectorModal"

import "./header.css"

export function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="brandmark" aria-label="Synthos home">
      <span className="brandmark-mark" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 17 L9 6 L13 13 L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="19" cy="4" r="2.1" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="brandmark-word">
          Synthos
          <em>Creative Intelligence</em>
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const { user, isLoaded, isSignedIn } = useUser()
  const [isAdmin, setIsAdmin] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/auth/is-admin")
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin !== false))
        .catch(() => setIsAdmin(true))
    } else {
      setIsAdmin(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          setNotifications(data.notifications || [])
          setUnread(data.unread || 0)
        })
        .catch(() => {})
    }
  }, [isSignedIn])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(Math.max(0, unread - 1))
  }

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id)
    setNotifOpen(false)
    if (n.refId) {
      router.push(`/dashboard/projects/${n.refId}`)
    }
  }

  const markAllAsRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}`, { method: "PATCH" })))
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }

    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside as any)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside as any)
    }
  }, [notifOpen])

  return (
    <>
      <HeaderContent
        open={open}
        setOpen={setOpen}
        pathname={pathname}
        isSignedIn={!!isSignedIn}
        isAdmin={isAdmin}
        isLoaded={isLoaded}
        notifRef={notifRef}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        unread={unread}
        notifications={notifications}
        handleNotificationClick={handleNotificationClick}
        markAllAsRead={markAllAsRead}
        onOpenRoleModal={() => setRoleModalOpen(true)}
      />
      <RoleSelectorModal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
    </>
  )
}

function HeaderContent({
  open,
  setOpen,
  pathname,
  isSignedIn,
  isAdmin,
  isLoaded,
  notifRef,
  notifOpen,
  setNotifOpen,
  unread,
  notifications,
  handleNotificationClick,
  markAllAsRead,
  onOpenRoleModal,
}: any) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <BrandMark />
        </div>

        <nav className={`topnav ${open ? "open" : ""}`}>
          <Link href="/" className={`topnav-link ${pathname === "/" ? "active" : ""}`} onClick={() => setOpen(false)}>Home</Link>
          <Link href="/intake" className={`topnav-link ${pathname === "/intake" ? "active" : ""}`} onClick={() => setOpen(false)}>Start a Project</Link>
          {isSignedIn && (
            <>
              <Link href="/dashboard/overview" className={`topnav-link ${pathname.startsWith("/dashboard") ? "active" : ""}`} onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/admin" className={`topnav-link ${pathname.startsWith("/admin") ? "active" : ""}`} onClick={() => setOpen(false)}>Admin</Link>
            </>
          )}
          <Link href="/presentation" className={`topnav-link ${pathname === "/presentation" ? "active" : ""}`} onClick={() => setOpen(false)}>Pitch Deck</Link>
        </nav>

        <div className="topbar-right">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onOpenRoleModal}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
          >
            <Users size={14} /> Select Role
          </button>

          {!isLoaded ? (
            <div style={{ width: 32, height: 32, background: "var(--surface-2)", borderRadius: "50%" }} />
          ) : isSignedIn ? (
            <>
              <div ref={notifRef} style={{ position: "relative" }}>
                <button className="iconbtn" aria-label="Notifications" title="Notifications" onClick={() => setNotifOpen((v: any) => !v)}>
                  <Bell size={18} strokeWidth={1.8} />
                  {unread > 0 && <span className="iconbtn-count">{unread}</span>}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-head">
                      <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>Notifications</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {unread > 0 && (
                          <button className="notif-mark-read" onClick={markAllAsRead}>
                            <Check size={12} /> Mark all read
                          </button>
                        )}
                        <button className="notif-close" onClick={() => setNotifOpen(false)}><X size={14} /></button>
                      </div>
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-item">
                          <p style={{ fontSize: "0.84rem", color: "var(--ink)" }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n: any) => (
                          <div key={n.id} className={`notif-item ${!n.read ? "notif-item--unread" : ""}`} onClick={() => handleNotificationClick(n)} style={{ cursor: "pointer" }}>
                            <p style={{ fontSize: "0.84rem", color: "var(--ink)", fontWeight: !n.read ? 600 : 400 }}>{n.title}</p>
                            <p style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 2 }}>{n.message}</p>
                            <span className="tiny muted" style={{ marginTop: 4, display: "block" }}>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/sign-in" className="btn btn-signal btn-sm">Get Started</Link>
          )}
          <button className={`topbar-burger ${open ? "open" : ""}`} onClick={() => setOpen((v: any) => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
