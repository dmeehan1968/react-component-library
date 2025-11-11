import type { TestType } from "@playwright/experimental-ct-core"
import { type ComponentFixtures, expect, test as baseTest } from "@playwright/experimental-ct-react"
import type { Issue } from "../../providers/issuesContext.tsx"

import { IssuesTableViewHelper } from "./index.ctspec.helper.tsx"
import * as ids from "./index.testids.ts"

baseTest.describe("IssuesTableView", () => {

  baseTest.describe("no data", () => {

    const issues: Issue[] = []
    const test = baseTest.extend<{ table: IssuesTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new IssuesTableViewHelper(mount, issues)
        await helper.mount({ dataSource: { issues } })
        await provide(helper)
      },
    })

    commonIssuesTableSuite(test)

    test('should contain no data message when empty', async ({ table }) => {
      await expect(table.noDataMessage).toBeVisible()
      await expect(table.noDataMessage).toHaveText(/no issues found/i)
    })

    test('should not render totals header or footer when there are no issues', async ({ table }) => {
      // Totals header cells should not exist
      await expect(table.root.getByTestId(ids.totalsHeaderRowId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsHeaderInputId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsHeaderOutputId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsHeaderCacheId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsHeaderCostId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsHeaderTimeId)).toBeHidden()

      // Totals footer cells should not exist
      await expect(table.root.getByTestId(ids.totalsFooterRowId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsFooterInputId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsFooterOutputId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsFooterCacheId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsFooterCostId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsFooterTimeId)).toBeHidden()
    })

  })

  baseTest.describe("with data", () => {
    const issues: Issue[] = [
      { id: 'i1', title: 'Issue 1', url: '/i1', project: 'Project A', description: 'Desc 1', timestamp: new Date('2025/01/02 12:00:00'), inputTokens: 1200, outputTokens: 3500, cacheTokens: 0, cost: 1.234, time: 65, status: 'succeeded' },
      { id: 'i2', title: 'Issue 2', url: '/i2', project: 'Project B', description: 'Desc 2', timestamp: new Date('2025/01/01 12:00:00'), inputTokens: 8000, outputTokens: 120, cacheTokens: 12, cost: 0.4, time: 5, status: 'running' },
      { id: 'i3', title: 'Issue 3', url: '/i3', project: 'Project C', description: 'Desc 3', timestamp: new Date('2025/01/03 12:00:00'), inputTokens: 50, outputTokens: 75, cacheTokens: 25, cost: 10, time: 3605, status: 'failed' },
    ]

    const test = baseTest.extend<{ table: IssuesTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new IssuesTableViewHelper(mount, issues)
        await helper.mount({ dataSource: { issues } })
        await provide(helper)
      },
    })

    commonIssuesTableSuite(test)

    test('should contain rows for each issue', async ({ table }) => {
      await expect(table.issueRows).toHaveCount(table.fixtures.length)
    })

    test('should render issue titles as links with correct href (timestamp desc order)', async ({ table }) => {
      const sorted = table.fixturesInTimestampDesc()
      const expectedTitles = sorted.map(i => i.title)
      const expectedUrls = sorted.map(i => i.url)

      const links = table.issueLinksAsRendered()
      await expect(links).toHaveText(expectedTitles)
      await expect.poll(() => table.issueLinkHrefsAsRendered()).toEqual(expectedUrls)
    })

    test('header totals equal footer totals', async ({ table }) => {
      // Poll to avoid race conditions during async data load
      await expect.poll(async () => {
        const h = await table.totalsHeader.input.textContent()
        const f = await table.totalsFooter.input.textContent()
        return h === f
      }).toBe(true)

      await expect.poll(async () => {
        const h = await table.totalsHeader.output.textContent()
        const f = await table.totalsFooter.output.textContent()
        return h === f
      }).toBe(true)

      await expect.poll(async () => {
        const h = await table.totalsHeader.cache.textContent()
        const f = await table.totalsFooter.cache.textContent()
        return h === f
      }).toBe(true)

      await expect.poll(async () => {
        const h = await table.totalsHeader.cost.textContent()
        const f = await table.totalsFooter.cost.textContent()
        return h === f
      }).toBe(true)

      await expect.poll(async () => {
        const h = await table.totalsHeader.time.textContent()
        const f = await table.totalsFooter.time.textContent()
        return h === f
      }).toBe(true)
    })

    test('every data row displays values matching the input fixtures', async ({ table }) => {
      const expected = await table.expectedRowValues()
      const rows = table.issueRows
      await expect(rows).toHaveCount(expected.length)

      for (let i = 0; i < expected.length; i++) {
        const exp = expected[i]
        const cells = table.cellsAt(i)

        // Issue link text and href
        await expect(cells.issueLink).toHaveText(exp.title)
        await expect.poll(() => cells.issueLink.getAttribute('href')).toEqual(exp.url)

        // Description
        await expect(cells.description).toHaveText(exp.description)

        // Timestamp (locale-formatted)
        await expect(cells.timestamp).toHaveText(exp.timestamp)

        // Numeric columns (locale-formatted)
        await expect(cells.input).toHaveText(exp.input)
        await expect(cells.output).toHaveText(exp.output)
        await expect(cells.cache).toHaveText(exp.cache)
        await expect(cells.cost).toHaveText(exp.cost)
        await expect(cells.time).toHaveText(exp.time)

        // Status
        await expect(cells.status).toHaveText(exp.status)
      }
    })

    test('header and footer totals match the values computed from fixtures', async ({ table }) => {
      const totals = await table.expectedTotals()
      // Header totals vs computed
      await expect(table.totalsHeader.input).toHaveText(totals.input)
      await expect(table.totalsHeader.output).toHaveText(totals.output)
      await expect(table.totalsHeader.cache).toHaveText(totals.cache)
      await expect(table.totalsHeader.cost).toHaveText(totals.cost)
      await expect(table.totalsHeader.time).toHaveText(totals.time)

      // Footer totals vs computed
      await expect(table.totalsFooter.input).toHaveText(totals.input)
      await expect(table.totalsFooter.output).toHaveText(totals.output)
      await expect(table.totalsFooter.cache).toHaveText(totals.cache)
      await expect(table.totalsFooter.cost).toHaveText(totals.cost)
      await expect(table.totalsFooter.time).toHaveText(totals.time)
    })

    test('numeric columns are right-aligned', async ({ table }) => {
      // Headers
      await expect(table.inputTokensColumn).toHaveClass(/\btext-right\b/)
      await expect(table.outputTokensColumn).toHaveClass(/\btext-right\b/)
      await expect(table.cacheTokensColumn).toHaveClass(/\btext-right\b/)
      await expect(table.costColumn).toHaveClass(/\btext-right\b/)
      await expect(table.timeColumn).toHaveClass(/\btext-right\b/)

      // Check all data row cells
      for (let i = 0 ; i < table.fixtures.length ; i++) {
        const cells = table.cellsAt(i)
        await expect(cells.input).toHaveClass(/\btext-right\b/)
        await expect(cells.output).toHaveClass(/\btext-right\b/)
        await expect(cells.cache).toHaveClass(/\btext-right\b/)
        await expect(cells.cost).toHaveClass(/\btext-right\b/)
        await expect(cells.time).toHaveClass(/\btext-right\b/)
      }

      // Totals header and footer cells
      await expect(table.totalsHeader.input).toHaveClass(/\btext-right\b/)
      await expect(table.totalsHeader.output).toHaveClass(/\btext-right\b/)
      await expect(table.totalsHeader.cache).toHaveClass(/\btext-right\b/)
      await expect(table.totalsHeader.cost).toHaveClass(/\btext-right\b/)
      await expect(table.totalsHeader.time).toHaveClass(/\btext-right\b/)

      await expect(table.totalsFooter.input).toHaveClass(/\btext-right\b/)
      await expect(table.totalsFooter.output).toHaveClass(/\btext-right\b/)
      await expect(table.totalsFooter.cache).toHaveClass(/\btext-right\b/)
      await expect(table.totalsFooter.cost).toHaveClass(/\btext-right\b/)
      await expect(table.totalsFooter.time).toHaveClass(/\btext-right\b/)
    })

    test('timestamp column is right-aligned', async ({ table }) => {
      // Header
      await expect(table.timestampColumn).toHaveClass(/\btext-right\b/)
      // All data row cells
      for (let i = 0 ; i < table.fixtures.length ; i++) {
        const cells = table.cellsAt(i)
        await expect(cells.timestamp).toHaveClass(/\btext-right\b/)
      }
    })

    test('totals header row appears between column headers and data rows', async ({ table }) => {
      const headerRows = table.root.locator('thead tr')
      // First row should be the column headers containing the select-column checkbox header
      await expect(headerRows.nth(0).getByTestId(ids.selectColumnId)).toBeVisible()
      // Second row should be the totals header row
      await expect(headerRows.nth(1)).toHaveAttribute('data-testid', ids.totalsHeaderRowId)
    })

    test('header checkbox selects all and toggles indeterminate', async ({ table }) => {
      const header = table.headerCheckbox
      const rowBoxes = table.rowCheckboxes()

      await expect(header).not.toBeChecked()
      await header.click()
      await expect(header).toBeChecked()
      await expect(rowBoxes).toHaveCount(table.fixtures.length)
      // All rows checked
      for (let i = 0; i < table.fixtures.length; i++) {
        await expect(rowBoxes.nth(i)).toBeChecked()
      }

      // Uncheck one row -> header should not be checked (indeterminate visually)
      await rowBoxes.nth(0).click()
      await expect(header).not.toBeChecked()
      await expect(header).toHaveJSProperty('indeterminate', true)

      // Click header -> selects all again
      await header.click()
      for (let i = 0; i < table.fixtures.length; i++) {
        await expect(rowBoxes.nth(i)).toBeChecked()
      }
    })

  })

  baseTest.describe('with error', () => {

    const test = baseTest.extend<{ table: IssuesTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new IssuesTableViewHelper(mount, [])
        await helper.mount({ dataSource: { error: 'fetch failed' } })
        await provide(helper)
      },
    })

    commonIssuesTableSuite(test)

    test('error is shown when fetching issues fails', async ({ table }) => {
      await expect(table.errorMessage).toBeVisible()
      await expect(table.errorMessage).toHaveText(/fetch failed/i)
    })

    test('should not render totals header or footer when there is an error', async ({ table }) => {
      await expect(table.root.getByTestId(ids.totalsHeaderRowId)).toBeHidden()
      await expect(table.root.getByTestId(ids.totalsFooterRowId)).toBeHidden()
    })

  })
})

function commonIssuesTableSuite<T extends TestType<ComponentFixtures & { table: IssuesTableViewHelper }>>(test: T) {
  test('should render a table', async ({ table }) => {
    await expect(table.tagName).resolves.toEqual('TABLE')
  })

  test('should contain all required columns', async ({ table }) => {
    await expect(table.selectColumn).toBeVisible()
    await expect(table.issueColumn).toBeVisible()
    await expect(table.descriptionColumn).toBeVisible()
    await expect(table.timestampColumn).toBeVisible()
    await expect(table.inputTokensColumn).toBeVisible()
    await expect(table.outputTokensColumn).toBeVisible()
    await expect(table.cacheTokensColumn).toBeVisible()
    await expect(table.costColumn).toBeVisible()
    await expect(table.timeColumn).toBeVisible()
    await expect(table.statusColumn).toBeVisible()
  })
}
