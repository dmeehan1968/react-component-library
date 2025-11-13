import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useIssues } from "../../hooks/useIssues.tsx"
import { useTableRowColumnCount } from "../../hooks/useTableRowColumnCount.tsx"
import type { IssuesContextType } from "../../providers/issuesContext.tsx"
import { sortByTimestampDesc } from "../../providers/sortByTimestampDesc.tsx"
import { TableMessage } from "../project-table/table-message"
import { T as ids } from "./index.testids.ts"
import { TotalsRow } from "./TotalsRow.tsx"
import { useFormatters } from "../../hooks/useFormatters.ts"

// Note: keep `useLocale` import as it's used via formatters for timestamp; exported hook provides all formatters

export const IssuesTableView: React.FC = () => {
  const { issues: fetchedIssues, isLoading, error } = useIssues()
  const [issues, setIssues] = React.useState<IssuesContextType['issues']>(fetchedIssues ?? [])
  const { formatTokens, formatCost, formatHMS, formatTimestamp } = useFormatters()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const { headerRowRef, columnCount } = useTableRowColumnCount()
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null)
  const navigateTo = useNavigate()

  const allIds = React.useMemo(() => (fetchedIssues ?? []).map(i => i.id), [fetchedIssues])
  const allSelected = selected.size > 0 && selected.size === allIds.length
  const someSelected = selected.size > 0 && selected.size < allIds.length

  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  const toggleOne = (id: string) => () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totals = React.useMemo(() => {
    return (fetchedIssues ?? []).reduce((acc, i) => {
      acc.input += i.inputTokens
      acc.output += i.outputTokens
      acc.cache += i.cacheTokens
      acc.cost += i.cost
      acc.time += i.time
      return acc
    }, { input: 0, output: 0, cache: 0, cost: 0, time: 0 })
  }, [fetchedIssues])

  React.useEffect(() => {
    setIssues(sortByTimestampDesc(fetchedIssues ?? []))
  }, [fetchedIssues])

  return (
    <table className="table table-zebra h-full">
      <thead>
      {/* Column labels row with header checkbox */}
      <tr ref={headerRowRef}>
        <th data-testid={ids.columns.select.header}>
          <input
            type="checkbox"
            ref={headerCheckboxRef}
            checked={allSelected}
            onChange={toggleAll}
            data-testid={ids.checkbox.header}
            className="checkbox"
          />
        </th>
        <th data-testid={ids.columns.issue.header}>Issue</th>
        <th data-testid={ids.columns.timestamp.header} className="text-left">Timestamp</th>
        <th data-testid={ids.columns.inputTokens.header} className="text-right">Input Tokens</th>
        <th data-testid={ids.columns.outputTokens.header} className="text-right">Output Tokens</th>
        <th data-testid={ids.columns.cacheTokens.header} className="text-right">Cache Tokens</th>
        <th data-testid={ids.columns.cost.header} className="text-right">Cost</th>
        <th data-testid={ids.columns.time.header} className="text-right">Time</th>
        <th data-testid={ids.columns.status.header}>Status</th>
      </tr>
      {/* Totals header row (no checkbox) appears only when there is at least one issue */}
      {(issues ?? []).length > 0 && (
        <TotalsRow
          totals={totals}
          rowId={ids.rows.totalsHeader}
        />
      )}
      </thead>
      <tbody>
      {isLoading && (
        <TableMessage message="Loading..." testId={ids.messages.loading} colSpan={columnCount} />
      )}
      {error && (
        <TableMessage message={`Error: ${error}`} testId={ids.messages.error} className="text-error" colSpan={columnCount} />
      )}
      {!isLoading && !error && (issues ?? []).length === 0 && (
        <TableMessage message="No issues found" testId={ids.messages.noData} colSpan={columnCount} />
      )}
      {!isLoading && !error && (issues ?? []).map((issue) => (
        <tr
          key={issue.id}
          data-testid={ids.rows.bodyIssue}
          className="hover:bg-accent hover:shadow-md cursor-pointer"
          onClick={() => navigateTo(issue.url)}
          aria-label={`Navigate to ${issue.title} trajectories`}
        >
          <td onClick={(e) => e.stopPropagation()} className="bg-base-100">
            <input
              type="checkbox"
              className="checkbox"
              checked={selected.has(issue.id)}
              onChange={toggleOne(issue.id)}
              data-testid={ids.checkbox.row}
            />
          </td>
          <td data-testid={ids.columns.issue.cell} className="link link-primary no-underline font-bold">
            {issue.title}
          </td>
          <td data-testid={ids.columns.timestamp.cell} className="text-left whitespace-nowrap tabular-nums">{formatTimestamp(issue.timestamp)}</td>
          <td data-testid={ids.columns.inputTokens.cell} className="text-right">{formatTokens(issue.inputTokens)}</td>
          <td data-testid={ids.columns.outputTokens.cell} className="text-right">{formatTokens(issue.outputTokens)}</td>
          <td data-testid={ids.columns.cacheTokens.cell} className="text-right">{formatTokens(issue.cacheTokens)}</td>
          <td data-testid={ids.columns.cost.cell} className="text-right">{formatCost(issue.cost)}</td>
          <td data-testid={ids.columns.time.cell} className="text-right">{formatHMS(issue.time)}</td>
          <td data-testid={ids.columns.status.cell}>{issue.status}</td>
        </tr>
      ))}
      </tbody>
      {/* Totals footer row appears only when there is at least one issue */}
      {(issues ?? []).length > 0 && (
        <tfoot>
          <TotalsRow
            totals={totals}
            rowId={ids.rows.totalsFooter}
          />
        </tfoot>
      )}
    </table>
  )
}
