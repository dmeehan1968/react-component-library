import * as React from "react"

export interface Issue {
  id: string
  title: string
  url: string
  project: string
  description: string
  // Normalized as Date via zod when fetched from the API
  timestamp: Date
  inputTokens: number
  outputTokens: number
  cacheTokens: number
  cost: number
  time: number
  status: 'queued' | 'running' | 'succeeded' | 'failed'
}

export interface IssuesContextType {
  issues: Issue[]
  isLoading: boolean
  error: Error | undefined
}

export const IssuesContext = React.createContext<IssuesContextType | undefined>(undefined)
