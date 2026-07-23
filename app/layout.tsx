import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jitume Agency OS",
  description: "Meta-agent client engagement control plane",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
