import * as React from "react"
import { type Project, ProjectsContext, type ProjectsContextType } from "./projectsContext.tsx"
import { projectSort, type ProjectSortableColumns } from "./sortHelpers.tsx"
import { useColumnSort } from "../hooks/useColumnSort.ts"

export type SortableColumns = ProjectSortableColumns

export interface ProjectsProviderProps {
  children?: React.ReactNode
  dataSource?: { projects: Project[], error?: never, fetch?: never } | { error: string, projects?: never, fetch?: never } | { fetch: typeof fetch, projects?: never, error?: never }
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  dataSource = { fetch },
}) => {
  const [fetchedProjects, setFetchedProjects] = React.useState([] as Project[])
  const columns = React.useMemo(() => ['name', 'lastUpdated'] as const satisfies readonly SortableColumns[], [])
  const { sorted: projects, handleSort, indicator } = useColumnSort<Project, SortableColumns>(
    fetchedProjects,
    columns,
    projectSort,
    {
      initial: { column: 'name', order: 'asc' },
      // example configuration; can be overridden later if needed
      indicators: { asc: '↑', desc: '↓', none: '' },
    },
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<Error | undefined>(undefined)

  // sorting handled by useSort

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setError(undefined)
        if (dataSource.projects) {
          // add a small delay to simulate a network request
          setTimeout(() => setFetchedProjects(dataSource.projects!), 10)
        } else if (dataSource.error) {
          // add a small delay to simulate a network request
          setTimeout(() => setError(new Error(dataSource.error)), 10)
        } else if (dataSource.fetch) {
          const res = await dataSource.fetch!('/api/projects')
          if (res.ok) {
            setFetchedProjects(await res.json())
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

    void loadProjects()
  }, [dataSource])

  // projects are derived via useSort

  // indicators provided by useSort

  const value: ProjectsContextType = {
    projects,
    handleSort,
    indicator: { name: indicator.name, lastUpdated: indicator.lastUpdated },
    isLoading,
    error,
  }

  return (
    <ProjectsContext value={value}>
      {children}
    </ProjectsContext>
  )

}

