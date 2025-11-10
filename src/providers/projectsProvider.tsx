import * as React from "react"
import { type Project, ProjectsContext, type ProjectsContextType } from "./projectsContext.tsx"

export interface ProjectsProviderProps {
  children?: React.ReactNode
  projectsOrFetch?: { projects?: Project[], error?: string, fetch?: typeof fetch }
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  projectsOrFetch = { fetch },
}) => {
  const [fetchedProjects, setFetchedProjects] = React.useState<Project[]>(Array.isArray(projectsOrFetch) ? projectsOrFetch : [])
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
        console.log(projectsOrFetch)
        if (projectsOrFetch.projects) {
          setFetchedProjects(await new Promise(resolve => {
            setTimeout(() => {
              resolve(projectsOrFetch.projects!)
            }, 10)
          }))
        } else if (projectsOrFetch.error) {
          setError(await new Promise(resolve => {
            setTimeout(() => {
              resolve(new Error(projectsOrFetch.error))
            }, 10)
          }))
        } else if (projectsOrFetch.fetch) {
          const res = await projectsOrFetch.fetch!('/api/projects')
          console.log({ fetchImpl: projectsOrFetch, res })
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
  }, [projectsOrFetch])

  React.useEffect(() => {
    if (sort.column === 'name') {
      setProjects([...fetchedProjects].sort((a, b) => {
        return sort.order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }))
    } else if (sort.column === 'lastUpdated') {
      setProjects([...fetchedProjects].sort((a, b) => {
        return sort.order === 'asc'
          ? a.lastUpdated.getTime() - b.lastUpdated.getTime()
          : b.lastUpdated.getTime() - a.lastUpdated.getTime()
      }))
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