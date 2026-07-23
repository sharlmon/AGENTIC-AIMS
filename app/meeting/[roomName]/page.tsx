import { Suspense } from "react";
import { MeetingNode } from "@/components/meeting-node";

export default function MeetingPage({ params }: { params: { roomName: string } }) {
  const roomName = decodeURIComponent(params.roomName);

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAFAF8] p-12 text-zinc-950">
          <p className="animate-pulse font-serif text-2xl text-zinc-600">
            Initializing meeting node…
          </p>
        </main>
      }
    >
      <MeetingNode roomName={roomName} />
    </Suspense>
  );
}
