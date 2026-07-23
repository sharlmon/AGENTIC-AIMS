import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://synthos.studio"
  const now = new Date()

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/overview`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/briefs`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/meetings`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/intelligence`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/workshops`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/proposals`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/quotes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/approvals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ]
}
