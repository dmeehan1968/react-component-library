import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import type { Issue } from "../../providers/issuesContext.tsx"
import { IssuesProvider, type IssuesProviderProps } from "../../providers/issuesProvider.tsx"

import {
  cacheTokensColumnId,
  costColumnId,
  descriptionColumnId,
  errorMessageId,
  headerSelectCheckboxId,
  inputTokensColumnId,
  issueColumnId,
  issueId,
  issueRowId,
  loadingMessageId,
  noDataMessageId,
  outputTokensColumnId,
  descriptionId,
  inputTokensId,
  outputTokensId,
  cacheTokensId,
  costId,
  timeId,
  timestampId,
  rowSelectCheckboxId,
  selectColumnId,
  statusColumnId,
  statusId,
  timeColumnId,
  timestampColumnId,
  totalsFooterCacheId,
  totalsFooterCostId,
  totalsFooterInputId,
  totalsFooterOutputId,
  totalsFooterRowId,
  totalsFooterTimeId,
  totalsHeaderCacheId,
  totalsHeaderCostId,
  totalsHeaderInputId,
  totalsHeaderOutputId,
  totalsHeaderRowId,
  totalsHeaderTimeId,
} from "./index.testids.ts"
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

  async mount(props: IssuesProviderProps) {
    if (this._root) {
      await this._root.unmount()
    }
    this._root = await this._mount(
      <IssuesProvider {...props}>
        <IssuesTableView/>
      </IssuesProvider>
    )
  }

  get tagName() {
    return this.root.evaluate(el => el.tagName)
  }

  // Column headers
  get selectColumn() { return this.root.getByTestId(selectColumnId) }
  get issueColumn() { return this.root.getByTestId(issueColumnId) }
  get descriptionColumn() { return this.root.getByTestId(descriptionColumnId) }
  get timestampColumn() { return this.root.getByTestId(timestampColumnId) }
  get inputTokensColumn() { return this.root.getByTestId(inputTokensColumnId) }
  get outputTokensColumn() { return this.root.getByTestId(outputTokensColumnId) }
  get cacheTokensColumn() { return this.root.getByTestId(cacheTokensColumnId) }
  get costColumn() { return this.root.getByTestId(costColumnId) }
  get timeColumn() { return this.root.getByTestId(timeColumnId) }
  get statusColumn() { return this.root.getByTestId(statusColumnId) }

  // Rows and cells
  get issueRows() { return this.root.getByTestId(issueRowId) }
  issueTitlesAsRendered() { return this.root.getByTestId(issueRowId).locator(`[data-testid="${issueId}"]`).allTextContents() }
  issueLinksAsRendered() { return this.root.getByTestId(issueRowId).locator(`[data-testid="${issueId}"] a`) }
  async issueLinkHrefsAsRendered() {
    const links = this.issueLinksAsRendered()
    return links.evaluateAll(els => els.map(el => el.getAttribute('href') ?? ''))
  }

  // Selection
  get headerCheckbox() { return this.root.getByTestId(headerSelectCheckboxId) }
  rowCheckboxes() { return this.root.getByTestId(issueRowId).getByTestId(rowSelectCheckboxId) }

  // Totals
  get totalsHeaderRow() { return this.root.getByTestId(totalsHeaderRowId) }
  get totalsFooterRow() { return this.root.getByTestId(totalsFooterRowId) }
  get totalsHeader() {
    return {
      input: this.root.getByTestId(totalsHeaderInputId),
      output: this.root.getByTestId(totalsHeaderOutputId),
      cache: this.root.getByTestId(totalsHeaderCacheId),
      cost: this.root.getByTestId(totalsHeaderCostId),
      time: this.root.getByTestId(totalsHeaderTimeId),
    }
  }
  get totalsFooter() {
    return {
      input: this.root.getByTestId(totalsFooterInputId),
      output: this.root.getByTestId(totalsFooterOutputId),
      cache: this.root.getByTestId(totalsFooterCacheId),
      cost: this.root.getByTestId(totalsFooterCostId),
      time: this.root.getByTestId(totalsFooterTimeId),
    }
  }

  // First data row numeric cells (for alignment checks)
  get firstRowNumeric() {
    return {
      input: this.root.getByTestId(inputTokensId).first(),
      output: this.root.getByTestId(outputTokensId).first(),
      cache: this.root.getByTestId(cacheTokensId).first(),
      cost: this.root.getByTestId(costId).first(),
      time: this.root.getByTestId(timeId).first(),
    }
  }

  // Messages
  get noDataMessage() { return this.root.getByTestId(noDataMessageId) }
  get loadingMessage() { return this.root.getByTestId(loadingMessageId) }
  get errorMessage() { return this.root.getByTestId(errorMessageId) }

  // Utilities
  fixturesInTimestampDesc() {
    return [...this.fixtures].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Row-level cell accessors by index (rendered order)
  row(i: number) {
    const row = this.issueRows.nth(i)
    return {
      link: row.getByTestId(issueId).locator('a'),
      issue: row.getByTestId(issueId),
      description: row.getByTestId(descriptionId),
      timestamp: row.getByTestId(timestampId)
    }
  }

  // Individual cell collections (so we can nth() them by row index)
  private get _issueCells() { return this.root.getByTestId(issueId) }
  private get _descriptionCells() { return this.root.getByTestId(descriptionId) }
  private get _timestampCells() { return this.root.getByTestId(timestampId) }
  private get _inputCells() { return this.root.getByTestId(inputTokensId) }
  private get _outputCells() { return this.root.getByTestId(outputTokensId) }
  private get _cacheCells() { return this.root.getByTestId(cacheTokensId) }
  private get _costCells() { return this.root.getByTestId(costId) }
  private get _timeCells() { return this.root.getByTestId(timeId) }
  private get _statusCells() { return this.root.getByTestId(statusId) }

  cellsAt(index: number) {
    return {
      issueLink: this._issueCells.nth(index).locator('a'),
      description: this._descriptionCells.nth(index),
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
      description: string
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
        description: i.description,
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
