import { useEffect } from "react"
import * as React from "react"
import {
  issueCount,
  issueCountColumn,
  lastUpdated,
  lastUpdatedColumn,
  name,
  nameColumn,
  noDataMessage,
} from "./index.testids.ts"

function useProjects(initialProjects: Project[] = []) {
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

export interface Project {
  name: string
  lastUpdated: Date
  issueCount: number
}

export interface ProjectTableViewProps {
  projects?: Project[]
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = (
  props,
) => {
  const { projects, handleSort, indicator } = useProjects(props.projects)

  return (
    <table className="table table-zebra h-full">
      <thead>
      <tr>
        <th
          className="cursor-pointer"
          onClick={handleSort('name')}
          data-testid={nameColumn}
        >
          Name {indicator.name}
        </th>
        <th
          className="cursor-pointer"
          onClick={handleSort('lastUpdated')}
          data-testid={lastUpdatedColumn}
        >
          Last Updated {indicator.lastUpdated}
        </th>
        <th
          data-testid={issueCountColumn}
        >
          Issues
        </th>
      </tr>
      </thead>
      <tbody>
      {projects.length === 0 && (
        <tr>
          <td
            colSpan={3}
            className="text-center align-middle"
            data-testid={noDataMessage}
          >
            No projects found
          </td>
        </tr>
      )}
      {projects.map((project) => (
        <tr key={project.name} data-testid="project">
          <td data-testid={name}>{project.name}</td>
          <td data-testid={lastUpdated}>{project.lastUpdated.toLocaleString()}</td>
          <td data-testid={issueCount}>{project.issueCount}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}