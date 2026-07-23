import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
let genAI: GoogleGenerativeAI | null = null
let model: any = null

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" })
  } catch (e) {
    console.warn("Failed to initialize Gemini:", e)
  }
}

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!model) {
    return ""
  }

  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      return text.trim()
    } catch (error: any) {
      const status = error?.response?.status || error?.status
      if (status === 429 && attempt < maxRetries - 1) {
        const retryDelay = error?.response?.data?.error?.details?.[0]?.retryDelay || `${(attempt + 1) * 5000}ms`
        console.warn(`Gemini rate limited, retrying in ${retryDelay}...`)
        await new Promise(resolve => setTimeout(resolve, parseInt(retryDelay) || 5000))
        continue
      }
      console.error("Gemini API error:", error)
      return ""
    }
  }
  return ""
}
