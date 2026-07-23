import { getProject } from "@/lib/data-server"
import MeetingRoomClient from "./MeetingRoomClient"

export default async function MeetingRoomPage({ params }: { params: { roomName: string } }) {
  const roomName = params.roomName
  const projectId = roomName.split("-")[1]
  const project = projectId ? await getProject(projectId) : null

  return <MeetingRoomClient roomName={roomName} project={project} />
}
