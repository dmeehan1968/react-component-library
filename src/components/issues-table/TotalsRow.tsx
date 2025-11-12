import * as React from "react"
import * as ids from "./index.testids.ts"

type Totals = {
  input: number
  output: number
  cache: number
  cost: number
  time: number
}

type Props = {
  totals: Totals
  label?: string
  // formatters are injected so we keep locale-aware formatting centralized
  formatTokens: (n: number) => string
  formatCost: (n: number) => string
  formatHMS: (n: number) => string
  // test id for the <tr> element; child cell ids are standardized (input|output|cache|cost|time)
  rowId: string
}

export const TotalsRow: React.FC<Props> = ({
  totals,
  label = "Project Summary",
  formatTokens,
  formatCost,
  formatHMS,
  rowId,
}) => {
  return (
    <tr className="bg-base-200 font-semibold" data-testid={rowId}>
      {/* Blank cells spanning Select + Issue + Description + Timestamp */}
      <th></th>
      <th colSpan={3}>{label}</th>
      {/* Totals aligned under token/cost/time columns */}
      <th data-testid={ids.inputTokensId} className="text-right">{formatTokens(totals.input)}</th>
      <th data-testid={ids.outputTokensId} className="text-right">{formatTokens(totals.output)}</th>
      <th data-testid={ids.cacheTokensId} className="text-right">{formatTokens(totals.cache)}</th>
      <th data-testid={ids.costId} className="text-right">{formatCost(totals.cost)}</th>
      <th data-testid={ids.timeId} className="text-right">{formatHMS(totals.time)}</th>
      {/* Trailing blank for Status */}
      <th></th>
    </tr>
  )
}
