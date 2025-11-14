import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import type { CostBucket } from "../../hooks/useCostBuckets.ts"
import { CostChart, type CostChartProjectMeta } from "./index.tsx"

export interface CostChartFixtures {
  buckets: CostBucket[]
  projectTotals: Record<string, number>
  projectsMeta: Record<string, CostChartProjectMeta>
}

export class CostChartHelper {
  private _root: MountResult | undefined
  private readonly _mount: ComponentFixtures["mount"]

  constructor(mount: ComponentFixtures["mount"]) {
    this._mount = mount
  }

  get root(): Locator {
    if (!this._root) {
      throw new Error("CostChartHelper not mounted")
    }
    return this._root
  }

  async mount(fixtures: CostChartFixtures) {
    if (this._root) {
      await this._root.unmount()
    }
    this._root = await this._mount(
      <CostChart
        buckets={fixtures.buckets}
        projectTotals={fixtures.projectTotals}
        projectsMeta={fixtures.projectsMeta}
      />,
    )
  }

  get legendButtons() {
    return this.root.getByRole("button")
  }

  get chartRegion() {
    return this.root.getByRole("region", { name: "Cost over time per project" })
  }
}
