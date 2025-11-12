import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import { type Issue, IssuesContext, type IssuesContextType } from "../../providers/issuesContext.tsx"

import { T as ids } from "./index.testids.ts"
import { IssuesTableView } from "./index.tsx"

export class IssuesTableViewHelper {
  readonly fixtures: Issue[]
  private _root: MountResult | undefined
  private readonly _mount: ComponentFixtures['mount']

  constructor(mount: ComponentFixtures['mount'], issues: Issue[]) {
    this._mount = mount
    this.fixtures = issues
  }

  get root(): Locator {
    if (!this._root) {
      throw new Error('IssuesTableViewHelper not mounted')
    }
    return this._root
  }

  async mount(props: IssuesContextType) {
    if (this._root) {
      await this._root.unmount()
    }
    this._root = await this._mount(
      <IssuesContext value={props}>
        <IssuesTableView/>
      </IssuesContext>
    )
  }

  get tagName() {
    return this.root.evaluate(el => el.tagName)
  }

  // Column headers
  get selectColumn() { return this.root.getByTestId(ids.columns.select.header) }
  get issueColumn() { return this.root.getByTestId(ids.columns.issue.header) }
  get timestampColumn() { return this.root.getByTestId(ids.columns.timestamp.header) }
  get inputTokensColumn() { return this.root.getByTestId(ids.columns.inputTokens.header) }
  get outputTokensColumn() { return this.root.getByTestId(ids.columns.outputTokens.header) }
  get cacheTokensColumn() { return this.root.getByTestId(ids.columns.cacheTokens.header) }
  get costColumn() { return this.root.getByTestId(ids.columns.cost.header) }
  get timeColumn() { return this.root.getByTestId(ids.columns.time.header) }
  get statusColumn() { return this.root.getByTestId(ids.columns.status.header) }

  // Rows and cells
  get issueRows() { return this.root.getByTestId(ids.rows.bodyIssue) }
  issueLinksAsRendered() { return this.root.getByTestId(ids.rows.bodyIssue).locator(`[data-testid="${ids.columns.issue.cell}"] a`) }
  async issueLinkHrefsAsRendered() {
    const links = this.issueLinksAsRendered()
    return links.evaluateAll(els => els.map(el => el.getAttribute('href') ?? ''))
  }

  // Selection
  get headerCheckbox() { return this.root.getByTestId(ids.checkbox.header) }
  rowCheckboxes() { return this.root.getByTestId(ids.rows.bodyIssue).getByTestId(ids.checkbox.row) }

  // Totals
  get totalsHeader() {
    return {
      input: this.root.getByTestId(ids.rows.totalsHeader).getByTestId(ids.columns.inputTokens.cell),
      output: this.root.getByTestId(ids.rows.totalsHeader).getByTestId(ids.columns.outputTokens.cell),
      cache: this.root.getByTestId(ids.rows.totalsHeader).getByTestId(ids.columns.cacheTokens.cell),
      cost: this.root.getByTestId(ids.rows.totalsHeader).getByTestId(ids.columns.cost.cell),
      time: this.root.getByTestId(ids.rows.totalsHeader).getByTestId(ids.columns.time.cell),
    }
  }
  get totalsFooter() {
    return {
      input: this.root.getByTestId(ids.rows.totalsFooter).getByTestId(ids.columns.inputTokens.cell),
      output: this.root.getByTestId(ids.rows.totalsFooter).getByTestId(ids.columns.outputTokens.cell),
      cache: this.root.getByTestId(ids.rows.totalsFooter).getByTestId(ids.columns.cacheTokens.cell),
      cost: this.root.getByTestId(ids.rows.totalsFooter).getByTestId(ids.columns.cost.cell),
      time: this.root.getByTestId(ids.rows.totalsFooter).getByTestId(ids.columns.time.cell),
    }
  }

  // Messages
  get noDataMessage() { return this.root.getByTestId(ids.messages.noData) }
  get errorMessage() { return this.root.getByTestId(ids.messages.error) }

  // Utilities
  fixturesInTimestampDesc() {
    return [...this.fixtures].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Row-level cell accessors by index (rendered order)
  // Removed unused row-level accessor in favor of `cellsAt()`

  // Individual cell collections (so we can nth() them by row index)
  private get _issueCells() { return this.issueRows.getByTestId(ids.columns.issue.cell) }
  private get _timestampCells() { return this.issueRows.getByTestId(ids.columns.timestamp.cell) }
  private get _inputCells() { return this.issueRows.getByTestId(ids.columns.inputTokens.cell) }
  private get _outputCells() { return this.issueRows.getByTestId(ids.columns.outputTokens.cell) }
  private get _cacheCells() { return this.issueRows.getByTestId(ids.columns.cacheTokens.cell) }
  private get _costCells() { return this.issueRows.getByTestId(ids.columns.cost.cell) }
  private get _timeCells() { return this.issueRows.getByTestId(ids.columns.time.cell) }
  private get _statusCells() { return this.issueRows.getByTestId(ids.columns.status.cell) }

  cellsAt(index: number) {
    return {
      issueLink: this._issueCells.nth(index).locator('a'),
      timestamp: this._timestampCells.nth(index),
      input: this._inputCells.nth(index),
      output: this._outputCells.nth(index),
      cache: this._cacheCells.nth(index),
      cost: this._costCells.nth(index),
      time: this._timeCells.nth(index),
      status: this._statusCells.nth(index),
    }
  }

  // Browser-locale formatting helpers (run in page context for stability)
  async fmtTokens(n: number) {
    return this.root.evaluate((_el, v) => new Intl.NumberFormat(navigator.language).format(v as number), n)
  }

  async fmtCost(n: number) {
    return this.root.evaluate((_el, v) => new Intl.NumberFormat(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v as number), n)
  }

  async fmtHMS(totalSeconds: number) {
    return this.root.evaluate((_el, v) => {
      const seconds = Math.max(0, Math.floor(v as number))
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      const pad = (x: number) => x.toString().padStart(2, '0')
      return `${pad(h)}:${pad(m)}:${pad(s)}`
    }, totalSeconds)
  }

  async fmtTimestamp(epochMs: number) {
    return this.root.evaluate((_el, ms) => new Date(ms as number).toLocaleString(navigator.language), epochMs)
  }

  // Compute expected formatted strings for each row, in rendered (timestamp-desc) order
  async expectedRowValues() {
    const sorted = this.fixturesInTimestampDesc()
    const results: Array<{
      title: string
      url: string
      timestamp: string
      input: string
      output: string
      cache: string
      cost: string
      time: string
      status: string
    }> = []
    for (const i of sorted) {
      results.push({
        title: i.title,
        url: i.url,
        timestamp: await this.fmtTimestamp(i.timestamp.getTime()),
        input: await this.fmtTokens(i.inputTokens),
        output: await this.fmtTokens(i.outputTokens),
        cache: await this.fmtTokens(i.cacheTokens),
        cost: await this.fmtCost(i.cost),
        time: await this.fmtHMS(i.time),
        status: i.status,
      })
    }
    return results
  }

  // Compute expected formatted totals from fixtures
  async expectedTotals() {
    const sums = this.fixtures.reduce((acc, i) => {
      acc.input += i.inputTokens
      acc.output += i.outputTokens
      acc.cache += i.cacheTokens
      acc.cost += i.cost
      acc.time += i.time
      return acc
    }, { input: 0, output: 0, cache: 0, cost: 0, time: 0 })

    return {
      input: await this.fmtTokens(sums.input),
      output: await this.fmtTokens(sums.output),
      cache: await this.fmtTokens(sums.cache),
      cost: await this.fmtCost(sums.cost),
      time: await this.fmtHMS(sums.time),
    }
  }
}
