import * as React from "react"
import { IssuesContext } from "../providers/issuesContext.tsx"

export function useIssues() {
  const context = React.useContext(IssuesContext)
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider')
  }
  return context
}
