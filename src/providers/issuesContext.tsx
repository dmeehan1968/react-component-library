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

export type IssuesContextType = {
    issues: Issue[]
    isLoading?: never
    error?: never
  } | {
    issues?: never
    isLoading: boolean
    error?: never
  } | {
    issues?: never
    isLoading?: never
    error: string
  }
export const IssuesContext = React.createContext<IssuesContextType | undefined>(undefined)
