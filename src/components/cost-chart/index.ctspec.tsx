import ctReact from "@playwright/experimental-ct-react"
import { CostChartHelper, type CostChartFixtures } from "./index.ctspec.helper.tsx"

export const test = ctReact.test.extend<{ chart: CostChartHelper }>({
  chart: async ({ mount }, provide) => {
    const helper = new CostChartHelper(mount)
    await provide(helper)
  },
})

const expect = ctReact.expect

function makeFixtures(): CostChartFixtures {
  const now = new Date()
  const bucketStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const bucketEnd = new Date(bucketStart.getTime() + 24 * 60 * 60 * 1000)

  return {
    buckets: [
      {
        start: bucketStart,
        end: bucketEnd,
        totalCost: 30,
        perProject: {
          "p-1": 10,
          "p-2": 20,
        },
      },
    ],
    projectTotals: {
      "p-1": 10,
      "p-2": 20,
    },
    projectsMeta: {
      "p-1": { name: "Project One" },
      "p-2": { name: "Project Two" },
    },
  }
}

test.describe("CostChart", () => {
  test("renders chart region and legend buttons", async ({ chart }) => {
    await chart.mount(makeFixtures())

    await ctReact.expect(chart.legendButtons).toHaveCount(2)
  })

  test("legend buttons act as toggles with aria-pressed", async ({ chart }) => {
    await chart.mount(makeFixtures())

    const buttons = await chart.legendButtons.all()
    const first = buttons[0]

    await expect(first).toHaveAttribute("aria-pressed", "true")
    await first.click()
    await expect(first).toHaveAttribute("aria-pressed", "false")
  })
})
