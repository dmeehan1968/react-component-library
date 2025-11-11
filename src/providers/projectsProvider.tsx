import * as React from "react"
import { type Project, ProjectsContext, type ProjectsContextType } from "./projectsContext.tsx"

export type SortableColumns = 'name' | 'lastUpdated'
export type SortOrder = 'asc' | 'desc'

export interface ProjectsProviderProps {
  children?: React.ReactNode
  dataSource?: { projects: Project[], error?: never, fetch?: never } | { error: string, projects?: never, fetch?: never } | { fetch: typeof fetch, projects?: never, error?: never }
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  dataSource = { fetch },
}) => {
  const [fetchedProjects, setFetchedProjects] = React.useState<Project[]>([])
  const [projects, setProjects] = React.useState<Project[]>(fetchedProjects)
  const [sort, setSort] = React.useState<{ column: 'name' | 'lastUpdated', order: 'asc' | 'desc' }>({
    column: 'name',
    order: 'asc',
  })
  const [sortIndicator, setSortIndicator] = React.useState<{ name: string, lastUpdated: string }>({
    name: '',
    lastUpdated: '',
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<Error | undefined>(undefined)

  const handleSort = (column: 'name' | 'lastUpdated') => {
    return () => {
      if (sort.column === column) {
        setSort({ column, order: sort.order === 'asc' ? 'desc' : 'asc' })
      } else {
        setSort({ column, order: 'asc' })
      }
    }
  }

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

  React.useEffect(() => {
    if (sort.column === 'name') {
      setProjects(byName(fetchedProjects, sort.order))
    } else if (sort.column === 'lastUpdated') {
      setProjects(byLastUpdated(fetchedProjects, sort.order))
    }
  }, [fetchedProjects, sort])

  React.useEffect(() => {
    setSortIndicator({
      name: sort.column === 'name' ? sort.order === 'asc' ? '↑' : '↓' : '',
      lastUpdated: sort.column === 'lastUpdated' ? sort.order === 'asc' ? '↑' : '↓' : '',
    })
  }, [sort])

  const value: ProjectsContextType = {
    projects,
    handleSort,
    indicator: sortIndicator,
    isLoading,
    error,
  }

  return (
    <ProjectsContext value={value}>
      {children}
    </ProjectsContext>
  )

}

const byName = (projects: Project[], order: SortOrder) => [...projects].sort((a, b) => a.name.localeCompare(b.name) * (order === 'asc' ? 1 : -1))
const byLastUpdated = (projects: Project[], order: SortOrder) => [...projects].sort((a, b) => (a.lastUpdated.getTime() - b.lastUpdated.getTime()) * (order === 'asc' ? 1 : -1))
