import * as React from "react"
import { useProjects } from "../../hooks/useProjects.tsx"
import { T as ids, sortIndicatorId } from "./index.testids.ts"
import { TableMessage } from "./table-message"
import { useColumnSort } from "../../hooks/useColumnSort.ts"
import { projectSort } from "./projectSort.tsx"
import { useNavigate } from 'react-router-dom'

export const ProjectTableView: React.FC = () => {
  const { projects, isLoading, error } = useProjects()
  const columns = React.useMemo(() => ['name', 'lastUpdated'] as const, [])
  const { sorted, handleSort, indicator } = useColumnSort(projects ?? [], columns, projectSort, {
    initial: { column: 'name', order: 'asc' },
    indicators: { asc: '↑', desc: '↓', none: '' },
  })
  const navigateTo = useNavigate()

  return (
    <table className="table table-zebra w-full h-full" data-testid={ids.base}>
      <thead>
      <tr>
        <th
          className="cursor-pointer"
          onClick={handleSort('name')}
          data-testid={ids.columns.name.header}
        >
          Name <span data-testid={sortIndicatorId}>{indicator.name}</span>
        </th>
        <th
          className="cursor-pointer"
          onClick={handleSort('lastUpdated')}
          data-testid={ids.columns.lastUpdated.header}
        >
          Last Updated <span data-testid={sortIndicatorId}>{indicator.lastUpdated}</span>
        </th>
        <th
          data-testid={ids.columns.issueCount.header}
        >
          Issues
        </th>
        <th
          data-testid={ids.columns.ideNames.header}
        >
          IDE
        </th>
      </tr>
      </thead>
      <tbody>
      {isLoading && (
        <TableMessage
          message="Loading..."
          testId={ids.messages.loading}
        />
      )}
      {error && (
        <TableMessage
          message={`Error: ${error}`}
          testId={ids.messages.error}
          className="text-error"
        />
      )}
      {!isLoading && !error && sorted.length === 0 && (
        <TableMessage
          message="No projects found"
          testId={ids.messages.noData}
        />
      )}
      {!isLoading && !error && sorted.map((project) => (
        <tr
          key={project.name}
          data-testid={ids.rows.project}
          onClick={event => navigateTo(event.currentTarget.getAttribute('data-href') || '')}
          className="cursor-pointer hover:bg-accent hover:shadow-md"
          aria-label={`Navigate to ${project.name} issues page`}
          data-href={project.url}
        >
          <td data-testid={ids.columns.name.cell} className="link link-primary no-underline font-bold">
            {project.name}
          </td>
          <td data-testid={ids.columns.lastUpdated.cell} className="tabular-nums whitespace-nowrap">{project.lastUpdated.toLocaleString()}</td>
          <td data-testid={ids.columns.issueCount.cell}>{project.issueCount}</td>
          <td data-testid={ids.columns.ideNames.cell}>{project.ideNames.join(', ')}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}