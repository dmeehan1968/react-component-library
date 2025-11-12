import * as React from "react"
import { type Issue, IssuesContext, type IssuesContextType } from "./issuesContext.tsx"
import { parseIssues } from "../schemas/issue.ts"
import { sortByTimestampDesc } from "./sortByTimestampDesc.tsx"

export interface IssuesProviderProps {
  children?: React.ReactNode
  dataSource?: { issues: Issue[], error?: never, fetch?: never } | { error: string, issues?: never, fetch?: never } | { fetch: typeof fetch, issues?: never, error?: never }
}

export const IssuesProvider: React.FC<IssuesProviderProps> = ({ children, dataSource = { fetch } }) => {
  const [fetchedIssues, setFetchedIssues] = React.useState([] as Issue[])
  const [issues, setIssues] = React.useState<Issue[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<Error | undefined>(undefined)

  React.useEffect(() => {
    const loadIssues = async () => {
      try {
        setIsLoading(true)
        setError(undefined)
        const res = await dataSource.fetch!('/api/issues')
        if (res.ok) {
          const raw = await res.json()
          const parsed = parseIssues(raw) as Issue[]
          setFetchedIssues(parsed)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    void loadIssues()
  }, [dataSource])

  React.useEffect(() => {
    setIssues(sortByTimestampDesc(fetchedIssues))
  }, [fetchedIssues])

  const value: IssuesContextType = {
    issues,
    isLoading,
    error,
  }

  return (
    <IssuesContext value={value}>
      {children}
    </IssuesContext>
  )
}
