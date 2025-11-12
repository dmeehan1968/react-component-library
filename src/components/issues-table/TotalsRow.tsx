import * as React from "react"

type Totals = {
  input: number
  output: number
  cache: number
  cost: number
  time: number
}

type TotalsIds = {
  rowId: string
}

type Props = {
  totals: Totals
  label?: string
  // formatters are injected so we keep locale-aware formatting centralized
  formatTokens: (n: number) => string
  formatCost: (n: number) => string
  formatHMS: (n: number) => string
  ids: TotalsIds
}

export const TotalsRow: React.FC<Props> = ({
  totals,
  label = "Project Summary",
  formatTokens,
  formatCost,
  formatHMS,
  ids,
}) => {
  return (
    <tr className="bg-base-200 font-semibold" data-testid={ids.rowId}>
      {/* Blank cells spanning Select + Issue + Description + Timestamp */}
      <th></th>
      <th colSpan={3}>{label}</th>
      {/* Totals aligned under token/cost/time columns */}
      <th data-testid="input" className="text-right">{formatTokens(totals.input)}</th>
      <th data-testid="output" className="text-right">{formatTokens(totals.output)}</th>
      <th data-testid="cache" className="text-right">{formatTokens(totals.cache)}</th>
      <th data-testid="cost" className="text-right">{formatCost(totals.cost)}</th>
      <th data-testid="time" className="text-right">{formatHMS(totals.time)}</th>
      {/* Trailing blank for Status */}
      <th></th>
    </tr>
  )
}
