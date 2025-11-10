import * as React from "react"
import { useProjects } from "../../hooks/useProjects.tsx"
import {
  errorMessage,
  issueCount,
  issueCountColumn,
  lastUpdated,
  lastUpdatedColumn,
  loadingMessage,
  name,
  nameColumn,
  noDataMessage,
} from "./index.testids.ts"
import { TableMessage } from "./table-message"

export const ProjectTableView: React.FC = () => {
  const { projects, handleSort, indicator, isLoading, error } = useProjects()

  return (
    <table className="table table-zebra h-full">
      <thead>
      <tr>
        <th
          className="cursor-pointer"
          onClick={handleSort('name')}
          data-testid={nameColumn}
        >
          Name <span data-testid="sort-indicator">{indicator.name}</span>
        </th>
        <th
          className="cursor-pointer"
          onClick={handleSort('lastUpdated')}
          data-testid={lastUpdatedColumn}
        >
          Last Updated <span data-testid="sort-indicator">{indicator.lastUpdated}</span>
        </th>
        <th
          data-testid={issueCountColumn}
        >
          Issues
        </th>
      </tr>
      </thead>
      <tbody>
      {isLoading && (
        <TableMessage
          message="Loading..."
          testId={loadingMessage}
        />
      )}
      {error && (
        <TableMessage
          message={`Error: ${error.message}`}
          testId={errorMessage}
          className="text-error"
        />
      )}
      {!isLoading && !error && projects.length === 0 && (
        <TableMessage
          message="No projects found"
          testId={noDataMessage}
        />
      )}
      {!isLoading && !error && projects.map((project) => (
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