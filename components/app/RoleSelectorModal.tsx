"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Sparkles, Briefcase, ArrowRight, X, ShieldCheck } from "lucide-react";

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectorModal({ isOpen, onClose }: RoleSelectorModalProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [selectedRole, setSelectedRole] = useState<"creator" | "client" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("synthos_user_role");
      if (saved === "creator" || saved === "client") {
        setSelectedRole(saved);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSelectRole = (role: "creator" | "client") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("synthos_user_role", role);
    }
    setSelectedRole(role);
    onClose();

    if (role === "creator") {
      router.push("/onboarding/creator");
    } else {
      router.push("/intake");
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(9, 9, 11, 0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "#121215",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "24px",
        maxWidth: "680px",
        width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
        padding: "40px",
        position: "relative",
        color: "#fafafa",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#a1a1aa",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.74rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "4px 14px",
            borderRadius: 100,
            background: "rgba(255, 255, 255, 0.08)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            marginBottom: 16,
          }}>
            <Sparkles size={14} /> Welcome to Synthos
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: "6px 0 10px", letterSpacing: "-0.03em" }}>
            What brings you to Synthos today?
          </h2>
          <p style={{ color: "#a1a1aa", fontSize: "0.98rem", maxWidth: "500px", margin: "0 auto" }}>
            Select your entry point to personalize your workspace experience:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Creator Card */}
          <div
            onClick={() => handleSelectRole("creator")}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: selectedRole === "creator" ? "2px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "28px 24px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "#ffffff",
                display: "grid",
                placeItems: "center",
                color: "#09090b",
                marginBottom: 18,
              }}>
                <ShieldCheck size={26} />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#a1a1aa", letterSpacing: "0.05em" }}>
                Creator & Agency Network
              </span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "6px 0 10px", color: "#ffffff" }}>
                I am a Creator / Agency Lead
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#a1a1aa", lineHeight: 1.55 }}>
                Register developer or creative credentials, access Mission Control, review AI proposals, and manage project workflows.
              </p>
            </div>
            <div style={{
              marginTop: 28,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#ffffff",
            }}>
              Onboard as Creator <ArrowRight size={16} />
            </div>
          </div>

          {/* Client Card */}
          <div
            onClick={() => handleSelectRole("client")}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: selectedRole === "client" ? "2px solid #34d399" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "28px 24px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "grid",
                placeItems: "center",
                color: "#34d399",
                marginBottom: 18,
              }}>
                <Briefcase size={26} />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#34d399", letterSpacing: "0.05em" }}>
                Client Portal
              </span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "6px 0 10px", color: "#ffffff" }}>
                I am a Client
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#a1a1aa", lineHeight: 1.55 }}>
                Submit project goals, join discovery meetings, review AI briefs, and approve proposals & quotes.
              </p>
            </div>
            <div style={{
              marginTop: 28,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#34d399",
            }}>
              Start a Project / Submit Brief <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
