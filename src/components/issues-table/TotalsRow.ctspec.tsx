import { expect, test as baseTest } from "@playwright/experimental-ct-react"

import { T as ids } from "./index.testids.ts"
import { TotalsRowHelper } from "./TotalsRow.ctspec.helper.tsx"

baseTest.describe("TotalsRow", () => {
  const totals = { input: 1200, output: 3500, cache: 25, cost: 12.345, time: 3665 }
  // No function props passed (CT limitation). Component formats internally via shared hook.

  const test = baseTest.extend<{ totalsRow: TotalsRowHelper }>({
    totalsRow: async ({ mount }, provide) => {
      const helper = new TotalsRowHelper(mount)
      await helper.mount({ totals, rowId: ids.rows.totalsHeader })
      await provide(helper)
    },
  })

  test("renders header with default label and formatted totals", async ({ totalsRow }) => {
    await expect(totalsRow.row).toBeVisible()
    // The summary heading is rendered inside a <th colSpan={3}> within the header group
    await expect(totalsRow.row.getByText(/project summary/i)).toBeVisible()
  })

  test("exposes standardized child test ids under header row", async ({ totalsRow }) => {
    await expect(totalsRow.row.getByTestId(ids.columns.inputTokens.cell)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.columns.outputTokens.cell)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.columns.cacheTokens.cell)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.columns.cost.cell)).toBeVisible()
    await expect(totalsRow.row.getByTestId(ids.columns.time.cell)).toBeVisible()
  })

  test("renders non-empty formatted totals into expected cells", async ({ totalsRow }) => {
    // Validate each cell has at least 1 visible character (format exactness covered by unit hook tests)
    await expect(totalsRow.cells.input).toHaveText(/\S/)
    await expect(totalsRow.cells.output).toHaveText(/\S/)
    await expect(totalsRow.cells.cache).toHaveText(/\S/)
    await expect(totalsRow.cells.cost).toHaveText(/\S/)
    await expect(totalsRow.cells.time).toHaveText(/\S/)
  })
})
