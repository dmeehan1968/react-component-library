import * as React from "react"

export interface Issue {
  id: string
  title: string
  url: string
  project: string
  description: string
  // API returns ISO 8601 string timestamps. Keep as string in the shared type
  // to avoid client/server drift. Convert to numbers/dates only at usage sites.
  timestamp: string
  inputTokens: number
  outputTokens: number
  cacheTokens: number
  cost: number
  time: number
  status: 'queued' | 'running' | 'succeeded' | 'failed' | (string & {})
}

export interface IssuesContextType {
  issues: Issue[]
  isLoading: boolean
  error: Error | undefined
}

export const IssuesContext = React.createContext<IssuesContextType | undefined>(undefined)
