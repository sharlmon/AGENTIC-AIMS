import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.FATHOM_API_KEY) {
    return NextResponse.json({ error: "FATHOM_API_KEY is not configured." }, { status: 500 });
  }
  try {
    const response = await fetch("https://api.fathom.ai/external/v1/meetings?include_transcript=true", {
      headers: { "X-Api-Key": process.env.FATHOM_API_KEY },
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: "Fathom request failed.", details: payload }, { status: response.status });
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Fathom ingestion failed", error);
    return NextResponse.json({ error: "Unable to contact Fathom." }, { status: 502 });
  }
}
