export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string | null) || "synthos"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timeoutMs = 15000
    try {
      const result = await Promise.race([
        new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder,
                resource_type: "auto",
                use_filename: true,
                unique_filename: true,
              },
              (error, result) => {
                if (error) reject(error)
                else resolve(result)
              }
            )
            .end(buffer)
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Upload timed out. Please try again.")), timeoutMs)
        ),
      ])

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      })
    } catch (cloudinaryError) {
      console.warn("Cloudinary upload failed, using base64 fallback:", cloudinaryError)
      const base64 = buffer.toString("base64")
      const mimeType = file.type || "image/png"
      const dataUrl = `data:${mimeType};base64,${base64}`

      return NextResponse.json({
        url: dataUrl,
        publicId: null,
        format: "base64",
        bytes: buffer.length,
      })
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    const message = error?.message || error?.error?.message || "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
