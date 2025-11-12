import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"

import { TotalsRow } from "./TotalsRow.tsx"
import type { TotalsRowProp } from "./TotalsRow.tsx"
import * as ids from "./index.testids.ts"

export class TotalsRowHelper {
  private _root: MountResult | undefined
  private readonly _mount: ComponentFixtures['mount']

  constructor(mount: ComponentFixtures['mount']) {
    this._mount = mount
  }

  get root(): Locator {
    if (!this._root) throw new Error('TotalsRowHelper not mounted')
    return this._root
  }

  // Mount using exactly the TotalsRow component props for API parity
  async mount(props: TotalsRowProp) {
    const { totals, formatTokens, formatCost, formatHMS, rowId } = props

    if (this._root) {
      await this._root.unmount()
    }
    this._root = await this._mount(
      <table className="table">
        <thead>
          {/* Minimal header row to mirror real table structure */}
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
          <TotalsRow
            totals={totals}
            formatTokens={formatTokens}
            formatCost={formatCost}
            formatHMS={formatHMS}
            rowId={rowId ?? ids.totalsHeaderRowId}
          />
        </thead>
      </table>
    )
  }

  // Accessors
  get row() { return this.root.getByTestId(ids.totalsHeaderRowId) }
  get cells() {
    const r = this.row
    return {
      input: r.getByTestId(ids.inputTokensId),
      output: r.getByTestId(ids.outputTokensId),
      cache: r.getByTestId(ids.cacheTokensId),
      cost: r.getByTestId(ids.costId),
      time: r.getByTestId(ids.timeId),
    }
  }

  // Browser-locale helpers evaluated in page context
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
}
