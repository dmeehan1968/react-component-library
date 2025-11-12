import * as React from "react"
import { type Issue, IssuesContext, type IssuesContextType } from "./issuesContext.tsx"
import { parseIssues } from "../schemas/issue.ts"
import type { FetchImpl } from "./projectsProvider.tsx"

export interface IssuesProviderProps {
  children?: React.ReactNode
  fetchImpl: FetchImpl
}

export const IssuesProvider: React.FC<IssuesProviderProps> = ({ children, fetchImpl }) => {
  const [fetchedIssues, setFetchedIssues] = React.useState([] as Issue[])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<Error | undefined>(undefined)

  React.useEffect(() => {
    const loadIssues = async () => {
      try {
        setIsLoading(true)
        setError(undefined)
        const res = await fetchImpl('/api/issues')
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
  }, [fetchImpl])

  const value: IssuesContextType =
    error ? { error: error.message ?? 'Unexpected error in fetch' } : isLoading ? { isLoading } : { issues: fetchedIssues }

  return (
    <IssuesContext value={value}>
      {children}
    </IssuesContext>
  )
}
