import { expect, test as baseTest } from "@playwright/experimental-ct-react"

import * as ids from "./index.testids.ts"
import { TotalsRowHelper } from "./TotalsRow.ctspec.helper.tsx"

baseTest.describe("TotalsRow", () => {
  const totals = { input: 1200, output: 3500, cache: 25, cost: 12.345, time: 3665 }
  // Browser-locale formatters to mirror app behavior
  const formatTokens = (n: number) => new Intl.NumberFormat(navigator.language).format(n)
  const formatCost = (n: number) => new Intl.NumberFormat(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  const formatHMS = (totalSeconds: number) => {
    const seconds = Math.max(0, Math.floor(totalSeconds))
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const pad = (v: number) => v.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }

  const test = baseTest.extend<{ totalsRow: TotalsRowHelper }>({
    totalsRow: async ({ mount }, provide) => {
      const helper = new TotalsRowHelper(mount)
      await helper.mount({ totals, formatTokens, formatCost, formatHMS, rowId: ids.totalsHeaderRowId })
      await provide(helper)
    },
  })

  test("renders header with default label and formatted totals", async ({ totalsRow }) => {
    await expect(totalsRow.row).toBeVisible()
    // The summary heading is rendered inside a <th colSpan={3}> within the header group
    await expect(totalsRow.row.getByText(/project summary/i)).toBeVisible()
  })

  test("exposes standardized child test ids under header row", async ({ totalsRow }) => {
    await expect(totalsRow.row.getByTestId(ids.inputTokensId)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.outputTokensId)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.cacheTokensId)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.costId)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.timeId)).toBeVisible()
  })
})
