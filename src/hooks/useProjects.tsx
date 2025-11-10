import * as React from "react"
import { ProjectsContext } from "../providers/projectsContext.tsx"

export function useProjects() {
  const context = React.useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}