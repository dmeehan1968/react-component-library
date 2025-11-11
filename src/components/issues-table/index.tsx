import * as React from "react"
import { useIssues } from "../../hooks/useIssues.tsx"
import { TableMessage } from "../project-table/table-message"
import * as ids from "./index.testids.ts"

const useLocale = () => {
  const [locale, setLocale] = React.useState<string>('en-US')
  React.useEffect(() => {
    setLocale(typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US')
  }, [])
  return locale
}

const useFormatters = () => {
  const locale = useLocale()
  const intFmt = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const twoDpFmt = React.useMemo(() => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale])
  const formatTokens = React.useCallback((n: number) => intFmt.format(n), [intFmt])
  const formatCost = React.useCallback((n: number) => twoDpFmt.format(n), [twoDpFmt])
  const formatHMS = React.useCallback((totalSeconds: number) => {
    const seconds = Math.max(0, Math.floor(totalSeconds))
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const pad = (v: number) => v.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }, [])
  const formatTimestamp = React.useCallback((d: Date) => d.toLocaleString(locale), [locale])
  return { formatTokens, formatCost, formatHMS, formatTimestamp }
}

export const IssuesTableView: React.FC = () => {
  const { issues, isLoading, error } = useIssues()
  const { formatTokens, formatCost, formatHMS, formatTimestamp } = useFormatters()

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null)

  const allIds = React.useMemo(() => issues.map(i => i.id), [issues])
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
    return issues.reduce((acc, i) => {
      acc.input += i.inputTokens
      acc.output += i.outputTokens
      acc.cache += i.cacheTokens
      acc.cost += i.cost
      acc.time += i.time
      return acc
    }, { input: 0, output: 0, cache: 0, cost: 0, time: 0 })
  }, [issues])

  const colCount = 10

  return (
    <table className="table table-zebra h-full">
      <thead>
      {/* Column labels row with header checkbox */}
      <tr>
        <th data-testid={ids.selectColumnId}>
          <input
            type="checkbox"
            ref={headerCheckboxRef}
            checked={allSelected}
            onChange={toggleAll}
            data-testid={ids.headerSelectCheckboxId}
            className="checkbox"
          />
        </th>
        <th data-testid={ids.issueColumnId}>Issue</th>
        <th data-testid={ids.descriptionColumnId}>Description</th>
        <th data-testid={ids.timestampColumnId}>Timestamp</th>
        <th data-testid={ids.inputTokensColumnId} className="text-right">Input Tokens</th>
        <th data-testid={ids.outputTokensColumnId} className="text-right">Output Tokens</th>
        <th data-testid={ids.cacheTokensColumnId} className="text-right">Cache Tokens</th>
        <th data-testid={ids.costColumnId} className="text-right">Cost</th>
        <th data-testid={ids.timeColumnId} className="text-right">Time</th>
        <th data-testid={ids.statusColumnId}>Status</th>
      </tr>
      {/* Totals header row (no checkbox) should appear between headers and data rows */}
      <tr className="bg-base-200 font-semibold" data-testid={ids.totalsHeaderRowId}>
        {/* Blank cells spanning Select + Issue + Description + Timestamp */}
        <th colSpan={4}></th>
        {/* Totals aligned under token/cost/time columns */}
        <th data-testid={ids.totalsHeaderInputId} className="text-right">{formatTokens(totals.input)}</th>
        <th data-testid={ids.totalsHeaderOutputId} className="text-right">{formatTokens(totals.output)}</th>
        <th data-testid={ids.totalsHeaderCacheId} className="text-right">{formatTokens(totals.cache)}</th>
        <th data-testid={ids.totalsHeaderCostId} className="text-right">{formatCost(totals.cost)}</th>
        <th data-testid={ids.totalsHeaderTimeId} className="text-right">{formatHMS(totals.time)}</th>
        {/* Trailing blank for Status */}
        <th></th>
      </tr>
      </thead>
      <tbody>
      {isLoading && (
        <TableMessage message="Loading..." testId={ids.loadingMessageId} colSpan={colCount} />
      )}
      {error && (
        <TableMessage message={`Error: ${error.message}`} testId={ids.errorMessageId} className="text-error" colSpan={colCount} />
      )}
      {!isLoading && !error && issues.length === 0 && (
        <TableMessage message="No issues found" testId={ids.noDataMessageId} colSpan={colCount} />
      )}
      {!isLoading && !error && issues.map((issue) => (
        <tr key={issue.id} data-testid={ids.issueRowId}>
          <td>
            <input
              type="checkbox"
              className="checkbox"
              checked={selected.has(issue.id)}
              onChange={toggleOne(issue.id)}
              data-testid={ids.rowSelectCheckboxId}
            />
          </td>
          <td data-testid={ids.issueId}>
            <a href={issue.url} rel="noopener noreferrer" target="_blank" className="link link-primary">
              {issue.title}
            </a>
          </td>
          <td data-testid={ids.descriptionId}>{issue.description}</td>
          <td data-testid={ids.timestampId}>{formatTimestamp(issue.timestamp)}</td>
          <td data-testid={ids.inputTokensId} className="text-right">{formatTokens(issue.inputTokens)}</td>
          <td data-testid={ids.outputTokensId} className="text-right">{formatTokens(issue.outputTokens)}</td>
          <td data-testid={ids.cacheTokensId} className="text-right">{formatTokens(issue.cacheTokens)}</td>
          <td data-testid={ids.costId} className="text-right">{formatCost(issue.cost)}</td>
          <td data-testid={ids.timeId} className="text-right">{formatHMS(issue.time)}</td>
          <td data-testid={ids.statusId}>{issue.status}</td>
        </tr>
      ))}
      </tbody>
      <tfoot>
      <tr className="bg-base-200 font-semibold" data-testid={ids.totalsFooterRowId}>
        {/* Blank cells spanning Select + Issue + Description + Timestamp */}
        <th colSpan={4}></th>
        {/* Totals aligned under token/cost/time columns */}
        <th data-testid={ids.totalsFooterInputId} className="text-right">{formatTokens(totals.input)}</th>
        <th data-testid={ids.totalsFooterOutputId} className="text-right">{formatTokens(totals.output)}</th>
        <th data-testid={ids.totalsFooterCacheId} className="text-right">{formatTokens(totals.cache)}</th>
        <th data-testid={ids.totalsFooterCostId} className="text-right">{formatCost(totals.cost)}</th>
        <th data-testid={ids.totalsFooterTimeId} className="text-right">{formatHMS(totals.time)}</th>
        {/* Trailing blank for Status */}
        <th></th>
      </tr>
      </tfoot>
    </table>
  )
}
