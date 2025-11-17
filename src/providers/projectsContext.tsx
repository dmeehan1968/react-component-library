import * as React from "react"
import type { Project } from "../schemas/project.ts"

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