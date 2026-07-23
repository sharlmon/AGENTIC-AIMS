import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";

export const resend = new Resend(apiKey);
export const defaultFromEmail = process.env.RESEND_FROM_EMAIL || "Sharlmon <hello@sharl-tech.co.ke>";
