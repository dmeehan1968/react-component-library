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
  sortIndicatorId,
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
          message={`Error: ${error.message}`}
          testId={errorMessageId}
          className="text-error"
        />
      )}
      {!isLoading && !error && projects.length === 0 && (
        <TableMessage
          message="No projects found"
          testId={noDataMessageId}
        />
      )}
      {!isLoading && !error && projects.map((project) => (
        <tr key={project.name} data-testid={projectId}>
          <td data-testid={nameId}>{project.name}</td>
          <td data-testid={lastUpdatedId}>{project.lastUpdated.toLocaleString()}</td>
          <td data-testid={issueCountId}>{project.issueCount}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}