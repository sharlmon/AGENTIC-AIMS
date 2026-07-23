"use client"

import { useState, useRef } from "react"
import { Plus, Trash2, Edit, Upload } from "lucide-react"
import { VoiceInput } from "@/components/app/VoiceInput"

type Post = {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  kind: string
  status: string
  publishedAt?: string
  authorName?: string
  tags: string[]
  createdAt: string
  updatedAt?: string
}

export function PostsManager({ kind, initialPosts }: { kind: "blog" | "news"; initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", coverImage: "", kind, status: "draft", publishedAt: "", authorName: "", tags: ""
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/posts?kind=${kind}`)
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  const startEdit = (post: Post) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      coverImage: post.coverImage || "",
      kind: kind,
      status: post.status,
      publishedAt: post.publishedAt || "",
      authorName: post.authorName || "",
      tags: post.tags.join(", "),
    })
    setEditId(post.id)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditId(null)
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", kind, status: "draft", publishedAt: "", authorName: "", tags: "" })
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", "synthos/posts")
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) {
      setForm({ ...form, coverImage: data.url })
    } else {
      alert(data.error || "Upload failed")
    }
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }

    try {
      if (editId) {
        await fetch(`/api/posts/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      cancelEdit()
      load()
    } catch (e) {
      console.error("Failed to save post:", e)
      alert("Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return
    await fetch(`/api/posts/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 className="admin-section-title" style={{ margin: 0 }}>{kind === "blog" ? "Blog Posts" : "News"}</h3>
        <button className="admin-btn" onClick={() => editing ? cancelEdit() : setEditing(true)}>
          <Plus size={16} /> {editing ? "Cancel" : "New Post"}
        </button>
      </div>

      {editing && (
        <div className="admin-section" style={{ marginBottom: 20, padding: 22 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div className="field">
              <label>Title</label>
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
            </div>
            <div className="field">
              <label>Slug (optional)</label>
              <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-from-title" />
            </div>
            <div className="field">
              <label>Excerpt</label>
              <VoiceInput value={form.excerpt} onChange={(val) => setForm({ ...form, excerpt: val })} placeholder="Short summary..." />
            </div>
            <div className="field">
              <label>Content</label>
              <VoiceInput value={form.content} onChange={(val) => setForm({ ...form, content: val })} placeholder="Full content..." rows={6} />
            </div>
            <div className="field">
              <label>Cover Image</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input ref={fileRef} type="file" accept="image/*" className="admin-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} style={{ display: "none" }} />
                <button className="admin-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload size={16} /> {uploading ? "Uploading..." : form.coverImage ? "Change image" : "Upload image"}
                </button>
                {form.coverImage && (
                  <span className="tiny" style={{ color: "#2e7d32" }}>✓ Uploaded</span>
                )}
              </div>
              {form.coverImage && (
                <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e5e7", maxWidth: 200 }}>
                  <img src={form.coverImage} alt="Cover preview" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Status</label>
                <select className="admin-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="field">
                <label>Publish Date</label>
                <input className="admin-input" type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Author Name</label>
              <input className="admin-input" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} placeholder="e.g. Mara O." />
            </div>
            <div className="field">
              <label>Tags (comma-separated)</label>
              <input className="admin-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="strategy, branding, campaign" />
            </div>
            <button className="admin-btn-primary" onClick={save} disabled={saving || !form.title || !form.content}>
              {saving ? "Saving..." : editId ? "Update Post" : "Publish Post"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#8e8e93", fontSize: "0.88rem" }}>Loading...</p>
      ) : posts.length === 0 ? (
        <div className="admin-section" style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "#8e8e93", fontSize: "0.88rem" }}>No {kind} posts yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table responsive-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Date</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td data-label="Title">
                    <div style={{ fontWeight: 600, color: "#1b1a17" }}>{post.title}</div>
                    {post.excerpt && <div style={{ fontSize: "0.78rem", color: "#8e8e93", marginTop: 2 }}>{post.excerpt.slice(0, 80)}...</div>}
                  </td>
                  <td data-label="Status">
                    <span className={`admin-badge admin-badge-${post.status}`}>{post.status}</span>
                  </td>
                  <td data-label="Author" className="admin-table-muted">{post.authorName || "—"}</td>
                  <td data-label="Date" className="admin-table-muted">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-icon-btn" title="Edit" onClick={() => startEdit(post)}><Edit size={14} /></button>
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => remove(post.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
