import * as React from "react"
import { type Project, ProjectsContext, type ProjectsContextType } from "./projectsContext.tsx"

export type FetchImpl = (req: RequestInfo| string, init?: RequestInit) => Promise<Response>

export interface ProjectsProviderProps {
  children?: React.ReactNode
  fetchImpl: FetchImpl
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  fetchImpl = fetch,
}) => {
  const [fetchedProjects, setFetchedProjects] = React.useState([] as Project[])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<Error | undefined>(undefined)

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setError(undefined)
        const res = await fetchImpl!('/api/projects')
        if (res.ok) {
          setFetchedProjects(await res.json())
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    void loadProjects()
  }, [fetchImpl])

  const value: ProjectsContextType =
    error ? { error: error.message } : isLoading ? { isLoading } : { projects: fetchedProjects }

  return (
    <ProjectsContext value={value}>
      {children}
    </ProjectsContext>
  )

}

