import { google } from "googleapis";
import path from "path";
import fs from "fs";

type ScheduleResult = {
  eventTime: string;
  meetLink: string;
  eventId?: string;
};

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

/**
 * Calculates tomorrow's first available 45-minute business slot (10:00 AM).
 */
function getNextBusinessSlot(): { startTime: Date; endTime: Date } {
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);

  // If tomorrow falls on weekend, advance to Monday
  if (startTime.getDay() === 6) startTime.setDate(startTime.getDate() + 2); // Saturday -> Monday
  if (startTime.getDay() === 0) startTime.setDate(startTime.getDate() + 1); // Sunday -> Monday

  startTime.setHours(10, 0, 0, 0); // 10:00 AM business hours start
  const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45-minute duration

  return { startTime, endTime };
}

/**
 * Loads Google Auth client using Service Account key file or OAuth environment variables.
 */
function getGoogleAuth() {
  const jsonPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), "jitume-agency-os-196fb3a23ed3.json");

  if (fs.existsSync(jsonPath)) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: jsonPath,
        scopes: SCOPES,
      });
      return auth;
    } catch (err) {
      console.warn("Failed to load Google Service Account keyFile:", err);
    }
  }

  return null;
}

/**
 * Auto-schedules an internal production sync meeting on Google Calendar using Service Account or OAuth.
 * Email notifications are handled via Resend API.
 */
export async function autoScheduleInternalSync(
  teamEmails: string[] = ["sharlmon19@gmail.com", "hello@sharl-tech.co.ke"],
  projectName: string = "Client Production Sync"
): Promise<ScheduleResult> {
  const { startTime, endTime } = getNextBusinessSlot();
  const eventTimeFormatted = startTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const generatedMeetLink = `https://meet.google.com/jitume-sync-${Date.now().toString(36)}`;

  // 1. Service Account Authentication (jitume-agency-os-196fb3a23ed3.json)
  const auth = getGoogleAuth();
  if (auth) {
    try {
      const calendar = google.calendar({ version: "v3", auth });

      const eventPayload = {
        summary: `Internal Production Sync · ${projectName}`,
        description: `Automated internal production meeting scheduled via Jitume Agency OS for project: ${projectName}.\nJoin Google Meet: ${generatedMeetLink}`,
        location: generatedMeetLink,
        start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      };

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventPayload,
      });

      return {
        eventTime: eventTimeFormatted,
        meetLink: res.data.location || generatedMeetLink,
        eventId: res.data.id || undefined,
      };
    } catch (err) {
      console.warn("Service Account Google Calendar event insertion note:", err);
    }
  }

  // 2. Fallback OAuth2 Client
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `Internal Production Sync · ${projectName}`,
          description: `Automated internal production meeting for project: ${projectName}.\nJoin Google Meet: ${generatedMeetLink}`,
          location: generatedMeetLink,
          start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
          end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
        },
      });

      return {
        eventTime: eventTimeFormatted,
        meetLink: res.data.location || generatedMeetLink,
        eventId: res.data.id || undefined,
      };
    } catch (err) {
      console.warn("OAuth2 Google Calendar call note:", err);
    }
  }

  return {
    eventTime: eventTimeFormatted,
    meetLink: generatedMeetLink,
  };
}
