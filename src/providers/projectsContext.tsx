import * as React from "react"

export interface Project {
  name: string
  lastUpdated: Date
  issueCount: number
}

export interface ProjectsContextType {
  projects: Project[]
  handleSort: (column: 'name' | 'lastUpdated') => () => void
  indicator: { name: string, lastUpdated: string }
  isLoading: boolean
  error: Error | undefined
}

export const ProjectsContext = React.createContext<ProjectsContextType | undefined>(undefined)