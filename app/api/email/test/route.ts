import { NextResponse } from "next/server";
import { resend, defaultFromEmail } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      to = "sharlmon19@gmail.com",
      subject = "Hello World",
      html = "<p>Congrats on sending your <strong>first email</strong>!</p>",
      from = defaultFromEmail,
    } = body;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY is not set." }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
