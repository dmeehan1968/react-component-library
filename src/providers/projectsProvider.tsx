import * as React from "react"
import { useEffect } from "react"
import { type Project, ProjectsContext, type ProjectsContextType } from "./projectsContext.tsx"

export interface ProjectsProviderProps {
  children: React.ReactNode
  initialProjects?: Project[]
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  initialProjects,
}) => {
  const [fetchedProjects, setFetchedProjects] = React.useState<Project[]>(initialProjects ?? [])
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

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setError(undefined)
        const res = await fetch('/api/projects')
        if (res.ok) {
          setFetchedProjects(await res.json())
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialProjects) {
      void loadProjects()
    }
  }, [initialProjects])

  useEffect(() => {
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

  useEffect(() => {
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