import * as React from "react"

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
  const [projects, setProjects] = React.useState<Project[]>(props.projects ?? [])
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  const handleNameSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)
    setProjects([...projects].sort((a, b) => {
      return newOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }))
  }

  return (
    <table className="table table-zebra h-full">
      <thead>
      <tr>
        <th
          className="cursor-pointer"
          onClick={handleNameSort}
          data-testid="name-column"
        >
          Name {sortOrder === 'asc' ? '↑' : '↓'}
        </th>
        <th
          data-testid="last-updated-column"
        >
          Last Updated
        </th>
        <th
          data-testid="issue-count-column"
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
            data-testid="no-data-message"
          >
            No projects found
          </td>
        </tr>
      )}
      {projects.map((project) => (
        <tr key={project.name}>
          <td data-testid="name">{project.name}</td>
          <td data-testid="last-updated">{project.lastUpdated.toLocaleString()}</td>
          <td data-testid="issue-count">{project.issueCount}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}