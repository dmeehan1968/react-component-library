import * as React from "react"
import { useEffect } from "react"

export interface Project {
  name: string
  lastUpdated: Date
  issueCount: number
}

export function useProjects(initialProjects: Project[] = []) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects)
  const [sort, setSort] = React.useState<{ column: 'name' | 'lastUpdated', order: 'asc' | 'desc' }>({
    column: 'name',
    order: 'asc',
  })
  const [sortIndicator, setSortIndicator] = React.useState<{ name: string, lastUpdated: string }>({
    name: '',
    lastUpdated: '',
  })

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
    if (sort.column === 'name') {
      setProjects([...initialProjects].sort((a, b) => {
        return sort.order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }))
    } else if (sort.column === 'lastUpdated') {
      setProjects([...initialProjects].sort((a, b) => {
        return sort.order === 'asc'
          ? a.lastUpdated.getTime() - b.lastUpdated.getTime()
          : b.lastUpdated.getTime() - a.lastUpdated.getTime()
      }))
    }
  }, [initialProjects, sort])

  useEffect(() => {
    setSortIndicator({
      name: sort.column === 'name' ? sort.order === 'asc' ? '↑' : '↓' : '',
      lastUpdated: sort.column === 'lastUpdated' ? sort.order === 'asc' ? '↑' : '↓' : '',
    })
  }, [sort])

  return { projects, handleSort, indicator: sortIndicator }
}