import * as React from "react"
import { useProjects } from "../../hooks/useProjects.tsx"
import {
  errorMessageId,
  issueCountId,
  issueCountColumnId,
  lastUpdatedId,
  lastUpdatedColumnId,
  loadingMessageId,
  nameId,
  nameColumnId,
  noDataMessageId,
  projectId,
  sortIndicatorId, projectsTableId,
} from "./index.testids.ts"
import { TableMessage } from "./table-message"
import { useColumnSort } from "../../hooks/useColumnSort.ts"
import { projectSort } from "./projectSort.tsx"
import { Link } from 'react-router-dom'

export const ProjectTableView: React.FC = () => {
  const { projects, isLoading, error } = useProjects()
  const columns = React.useMemo(() => ['name', 'lastUpdated'] as const, [])
  const { sorted, handleSort, indicator } = useColumnSort(projects ?? [], columns, projectSort, {
    initial: { column: 'name', order: 'asc' },
    indicators: { asc: '↑', desc: '↓', none: '' },
  })

  return (
    <table className="table table-zebra w-full h-full" data-testid={projectsTableId}>
      <thead>
      <tr>
        <th
          className="cursor-pointer"
          onClick={handleSort('name')}
          data-testid={nameColumnId}
        >
          Name <span data-testid={sortIndicatorId}>{indicator.name}</span>
        </th>
        <th
          className="cursor-pointer"
          onClick={handleSort('lastUpdated')}
          data-testid={lastUpdatedColumnId}
        >
          Last Updated <span data-testid={sortIndicatorId}>{indicator.lastUpdated}</span>
        </th>
        <th
          data-testid={issueCountColumnId}
        >
          Issues
        </th>
      </tr>
      </thead>
      <tbody>
      {isLoading && (
        <TableMessage
          message="Loading..."
          testId={loadingMessageId}
        />
      )}
      {error && (
        <TableMessage
          message={`Error: ${error}`}
          testId={errorMessageId}
          className="text-error"
        />
      )}
      {!isLoading && !error && sorted.length === 0 && (
        <TableMessage
          message="No projects found"
          testId={noDataMessageId}
        />
      )}
      {!isLoading && !error && sorted.map((project) => (
        <tr key={project.name} data-testid={projectId} className="hover:bg-accent hover:shadow-md">
          <td data-testid={nameId}>
            <Link
              to={project.url}
              className="link link-primary no-underline font-bold"
            >
              {project.name}
            </Link>
          </td>
          <td data-testid={lastUpdatedId}>{project.lastUpdated.toLocaleString()}</td>
          <td data-testid={issueCountId}>{project.issueCount}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}