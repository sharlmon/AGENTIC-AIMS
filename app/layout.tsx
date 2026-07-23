import type { Metadata } from "next"
import type React from "react"
import "./globals.css"
import { StoreProvider } from "@/lib/store"
import { ClerkProvider } from "@clerk/nextjs"
import Header from "@/components/app/Header"
import Footer from "@/components/app/Footer"

export const metadata: Metadata = {
  metadataBase: new URL("https://synthos.studio"),
  title: {
    default: "Synthos — Creative Intelligence & Project Automation",
    template: "%s · Synthos",
  },
  description:
    "Synthos is the operating system for creative intelligence. Turn client conversations and briefs into structured project intelligence, proposals, and human-approved deliverables.",
  openGraph: {
    title: "Synthos — Creative Intelligence & Project Automation",
    description: "AI accelerates the work. Humans provide the judgment.",
    url: "https://synthos.studio",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <StoreProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
