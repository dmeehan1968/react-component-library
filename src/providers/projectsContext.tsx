import * as React from "react"

export interface Project {
	name: string
	url: string
	lastUpdated: Date
	issueCount: number
	ideNames: string[]
}

export type ProjectsContextType =
  {
    projects: Project[]
    isLoading?: never
    error?: never
  }
  | {
    projects?: never
    isLoading: boolean
    error?: never
  }
  | {
    projects?: never
    isLoading?: never
    error: string
  }

export const ProjectsContext = React.createContext<ProjectsContextType | undefined>(undefined)