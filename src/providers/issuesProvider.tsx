import * as React from "react"
import { type Issue, IssuesContext, type IssuesContextType } from "./issuesContext.tsx"

export interface IssuesProviderProps {
  children?: React.ReactNode
  dataSource?: { issues: Issue[], error?: never, fetch?: never } | { error: string, issues?: never, fetch?: never } | { fetch: typeof fetch, issues?: never, error?: never }
}

const sortByTimestampDesc = (issues: Issue[]) =>
  [...issues].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

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
        if (dataSource.issues) {
          setTimeout(() => setFetchedIssues(dataSource.issues!), 10)
        } else if (dataSource.error) {
          setTimeout(() => setError(new Error(dataSource.error)), 10)
        } else if (dataSource.fetch) {
          const res = await dataSource.fetch!('/api/issues')
          if (res.ok) {
            setFetchedIssues(await res.json())
          }
        } else {
          setError(new Error('No fetch implementation provided'))
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
