"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Sparkles, UserCheck, Briefcase, ArrowRight, X, ShieldCheck } from "lucide-react";

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectorModal({ isOpen, onClose }: RoleSelectorModalProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [selectedRole, setSelectedRole] = useState<"creator" | "client" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("synthos_user_role");
    if (saved === "creator" || saved === "client") {
      setSelectedRole(saved);
    }
  }, []);

  if (!isOpen) return null;

  const handleSelectRole = (role: "creator" | "client") => {
    localStorage.setItem("synthos_user_role", role);
    setSelectedRole(role);
    onClose();

    if (role === "creator") {
      if (isSignedIn) {
        router.push("/dashboard/overview");
      } else {
        router.push("/sign-in");
      }
    } else {
      router.push("/intake");
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(10, 10, 12, 0.82)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "var(--surface, #18181b)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        maxWidth: "680px",
        width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        padding: "36px",
        position: "relative",
        color: "var(--ink, #fff)",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255,255,255,0.06)",
            border: "none",
            color: "var(--ink-2, #a1a1aa)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
          aria-label="Close role selector"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "4px 12px",
            borderRadius: 100,
            background: "rgba(99, 102, 241, 0.15)",
            color: "#818cf8",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            marginBottom: 12,
          }}>
            <Sparkles size={14} /> Workspace Gateway
          </span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 600, margin: "6px 0 8px" }}>
            Welcome to Synthos
          </h2>
          <p style={{ color: "var(--ink-2, #a1a1aa)", fontSize: "0.94rem" }}>
            Select your workspace role to customize your experience:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Creator Card */}
          <div
            onClick={() => handleSelectRole("creator")}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: selectedRole === "creator" ? "2px solid #818cf8" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "24px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="role-card-hover"
          >
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                marginBottom: 16,
              }}>
                <ShieldCheck size={24} />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#818cf8", letterSpacing: "0.05em" }}>
                Internal Team
              </span>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "6px 0 10px" }}>
                Creator / Agency Lead
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--ink-2, #a1a1aa)", lineHeight: 1.5 }}>
                Access Mission Control, run zero-touch AI proposal synthesis, track 10-stage workflows, CRM & Talent matching.
              </p>
            </div>
            <div style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#818cf8",
            }}>
              Go to Creator Workspace <ArrowRight size={16} />
            </div>
          </div>

          {/* Client Card */}
          <div
            onClick={() => handleSelectRole("client")}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: selectedRole === "client" ? "2px solid #34d399" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "24px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              justify.content: "space-between",
            }}
            className="role-card-hover"
          >
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                marginBottom: 16,
              }}>
                <Briefcase size={24} />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#34d399", letterSpacing: "0.05em" }}>
                Client Portal
              </span>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "6px 0 10px" }}>
                I am a Client
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--ink-2, #a1a1aa)", lineHeight: 1.5 }}>
                Submit project briefs, join discovery meetings, review contact reports, and approve proposals & quotes.
              </p>
            </div>
            <div style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#34d399",
            }}>
              Start a Project / Client Onboarding <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
