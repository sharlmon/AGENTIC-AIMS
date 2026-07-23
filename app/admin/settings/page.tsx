import { PageHead } from "@/components/app/Page"

export default function AdminSettingsPage() {
  return (
    <div className="admin-content">
      <PageHead eyebrow="Admin" title="Settings" desc="System configuration and preferences." />

      <div className="admin-section">
        <h3 className="admin-section-title">AI Configuration</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6e6e73", display: "block", marginBottom: 6 }}>Gemini API Key</label>
            <input className="admin-input" type="password" defaultValue="••••••••••••••••" disabled />
            <p style={{ fontSize: "0.78rem", color: "#8e8e93", marginTop: 4 }}>Set via GEMINI_API_KEY environment variable.</p>
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6e6e73", display: "block", marginBottom: 6 }}>Cloudinary Cloud Name</label>
            <input className="admin-input" type="text" defaultValue="••••••••••••••••" disabled />
            <p style={{ fontSize: "0.78rem", color: "#8e8e93", marginTop: 4 }}>Set via NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
