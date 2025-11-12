import * as React from "react"
import { T as ids } from "./index.testids.ts"

type Totals = {
  input: number
  output: number
  cache: number
  cost: number
  time: number
}

export type TotalsRowProp = {
  totals: Totals
  // formatters are injected so we keep locale-aware formatting centralized
  formatTokens: (n: number) => string
  formatCost: (n: number) => string
  formatHMS: (n: number) => string
  // test id for the <tr> element; child cell ids are standardized (input|output|cache|cost|time)
  rowId: string
}

export const TotalsRow: React.FC<TotalsRowProp> = ({
  totals,
  formatTokens,
  formatCost,
  formatHMS,
  rowId,
}) => {
  return (
    <tr className="bg-base-200 font-semibold" data-testid={rowId}>
      {/* Blank cells spanning Select + Issue + Description + Timestamp */}
      <th></th>
      <th colSpan={3}>Project Summary</th>
      {/* Totals aligned under token/cost/time columns */}
      <th data-testid={ids.columns.inputTokens.cell} className="text-right">{formatTokens(totals.input)}</th>
      <th data-testid={ids.columns.outputTokens.cell} className="text-right">{formatTokens(totals.output)}</th>
      <th data-testid={ids.columns.cacheTokens.cell} className="text-right">{formatTokens(totals.cache)}</th>
      <th data-testid={ids.columns.cost.cell} className="text-right">{formatCost(totals.cost)}</th>
      <th data-testid={ids.columns.time.cell} className="text-right">{formatHMS(totals.time)}</th>
      {/* Trailing blank for Status */}
      <th></th>
    </tr>
  )
}
