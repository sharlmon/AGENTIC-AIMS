export type StageId =
  | "brief"
  | "call"
  | "contactReport"
  | "productionMeeting"
  | "proposal"
  | "quote"
  | "approval"

export const STAGES: {
  id: StageId
  index: number
  label: string
  short: string
  description: string
}[] = [
  { id: "brief", index: 1, label: "Brief", short: "Brief", description: "Capture the client's needs and objectives." },
  { id: "call", index: 2, label: "First Meeting", short: "Meeting", description: "Discovery call with the client." },
  { id: "contactReport", index: 3, label: "Contact Report", short: "Report", description: "AI-generated summary for client confirmation." },
  { id: "productionMeeting", index: 4, label: "Production Meeting", short: "Production", description: "Team and client align on scope and approach." },
  { id: "proposal", index: 5, label: "Proposal", short: "Proposal", description: "Account manager drafts the proposal." },
  { id: "quote", index: 6, label: "Quote", short: "Quote", description: "Professional quote ready for client." },
  { id: "approval", index: 7, label: "Approval", short: "Approval", description: "Client accepts and the gig starts." },
]

export type Attr = "ai" | "human" | "mixed"
export type Status = "draft" | "review" | "approved" | "rejected"

export interface Insight {
  id: string
  text: string
  attr: Attr
  status: Status
  note?: string
}

export interface Project {
  id: string
  name: string
  client: string
  type: string
  stage: StageId
  progress: number
  status: "active" | "attention" | "review" | "complete"
  lastActivity: string
  nextAction: string
  owner: string
  aiActivity: number

  brief: {
    clientInfo: { name: string; company: string; contact: string; industry: string }
    title: string
    businessObjective: string
    objectives: string[]
    audience: string
    brand: string
    direction: string
    deliverables: string[]
    budget: string
    timeline: string
    attachments: string[]
    context: string
    aiAnalysis: {
      wants: string[]
      keyObjectives: string[]
      requirements: string[]
      risks: string[]
      missing: string[]
      questions: string[]
      confidence: number
    }
  }

  call: {
    date: string
    participants: string[]
    duration: string
    summary: string
    meetingSource?: string
    transcript?: string
  }

  transcript: {
    moments: { time: string; label: string; note: string }[]
    decisions: string[]
    actions: { who: string; task: string; due: string }[]
    requirements: string[]
    text: { speaker: string; role: "ai" | "client" | "team"; text: string }[]
  }

  understanding: {
    wants: Insight[]
    businessObjectives: Insight[]
    creativeObjectives: Insight[]
    constraints: Insight[]
    risks: Insight[]
    missing: Insight[]
    questions: Insight[]
    confidence: number
  }

  projectBrief: {
    summary: string
    businessObjective: string
    creativeObjective: string
    audience: string
    direction: string
    deliverables: string[]
    timeline: string
    budget: string
    risks: string[]
    openQuestions: string[]
    successCriteria: string[]
  }

  workshop: {
    questions: Insight[]
    brandInsights: Insight[]
    audienceInsights: Insight[]
    opportunities: Insight[]
    challenges: Insight[]
    directions: Insight[]
    humanNotes: string
  }

  synthesis: {
    executiveSummary: string
    strategicDirection: string
    creativeDirection: string
    approach: string
    deliverables: string[]
    timeline: string
    risks: string[]
    openQuestions: string[]
    decisions: string[]
  }

  proposal: {
    clientDetails: string
    overview: string
    problem: string
    solution: string
    scope: string[]
    deliverables: string[]
    timeline: string
    team: string[]
    investment: string
    terms: string
    status: Status
    sections: { title: string; body: string; attr: Attr }[]
  }

  quote: {
    services: { name: string; desc: string; qty: number; rate: number }[]
    discount: number
    tax: number
    paymentTerms: string
    status: Status
  }

  contactReport: {
    summary: string
    keyPoints: string[]
    decisions: string[]
    actionItems: any[]
    nextSteps: string[]
    approved: boolean
    sentToClient: boolean
    sentAt?: string
  }

  productionMeeting: {
    decision: string
    notes?: string
  }
}

export const STAGE_INDEX: Record<StageId, number> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.index }),
  {} as Record<StageId, number>
)
