export type FathomMeeting = {
  id: string;
  title: string;
  created_at: string;
  transcript?: string;
  summary?: string;
  recording_url?: string;
  attendees?: { name: string; email: string }[];
};

/**
 * Fetch meeting details and transcript directly from Fathom API using Bearer Auth
 */
export async function getFathomMeeting(meetingId: string): Promise<FathomMeeting | null> {
  const apiKey = process.env.FATHOM_API_KEY;
  if (!apiKey) {
    console.warn("FATHOM_API_KEY is not set in environment.");
    return null;
  }

  try {
    const res = await fetch(`https://api.fathom.video/v1/meetings/${encodeURIComponent(meetingId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`Fathom API returned status ${res.status} for meetingId: ${meetingId}`);
      return null;
    }

    const data = await res.json();
    return data as FathomMeeting;
  } catch (error) {
    console.error("Failed to fetch meeting from Fathom API:", error);
    return null;
  }
}

/**
 * List recent meetings from Fathom API
 */
export async function listFathomMeetings(limit: number = 10): Promise<FathomMeeting[]> {
  const apiKey = process.env.FATHOM_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`https://api.fathom.video/v1/meetings?limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data.meetings || data || []) as FathomMeeting[];
  } catch (error) {
    console.error("Failed to list meetings from Fathom API:", error);
    return [];
  }
}
