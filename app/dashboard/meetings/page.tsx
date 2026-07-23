import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import ExternalMeetingForm from "./ExternalMeetingForm"
import ExistingMeetings from "./ExistingMeetings"

export const dynamic = 'force-dynamic'

export default async function MeetingsPage({ searchParams }: { searchParams: { project?: string } }) {
  const projects = await getProjects()
  const selectedId = searchParams.project || ""

  return (
    <PageWrap>
      <PageHead eyebrow="Intelligence" title="External Meeting Capture" desc="Paste a transcript or AI meeting capture from an external meeting source. The system will use it to enrich the project intelligence." />

      <div className="stack gap-5">
        <ExternalMeetingForm projects={projects} selectedId={selectedId} />
        <ExistingMeetings projects={projects} />
      </div>
    </PageWrap>
  )
}