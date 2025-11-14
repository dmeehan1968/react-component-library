import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { CostBucket } from "../../hooks/useCostBuckets.ts"

const LOCAL_STORAGE_KEY = "homepageCostChart.legendSelection"

export interface CostChartProjectMeta {
  name: string
}

export interface CostChartProps {
  buckets: CostBucket[]
  projectTotals: Record<string, number>
  projectsMeta: Record<string, CostChartProjectMeta>
}

interface RechartsBucketDatum {
  bucketKey: string
  start: Date
  end: Date
  [projectId: string]: string | number | Date
}

type LegendSelection = {
  selectedIds: string[]
}

const rechartsPalette = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#d885d8",
]

export const CostChart: React.FC<CostChartProps> = ({ buckets, projectTotals, projectsMeta }) => {
  const allProjectIds = React.useMemo(
    () => Object.keys(projectTotals).sort((a, b) => projectTotals[b] - projectTotals[a]),
    [projectTotals],
  )

  const [visibleIds, setVisibleIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") {
      return allProjectIds.slice(0, 5)
    }
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!raw) {
        return allProjectIds.slice(0, 5)
      }
      const parsed = JSON.parse(raw) as LegendSelection
      const filtered = parsed.selectedIds.filter((id) => allProjectIds.includes(id))
      if (filtered.length === 0) {
        return allProjectIds.slice(0, 5)
      }
      return filtered
    } catch {
      return allProjectIds.slice(0, 5)
    }
  })

  React.useEffect(() => {
    if (allProjectIds.length === 0) {
      setVisibleIds([])
      return
    }
    setVisibleIds((prev) => {
      const existing = prev.filter((id) => allProjectIds.includes(id))
      if (existing.length > 0) {
        return existing
      }
      return allProjectIds.slice(0, 5)
    })
  }, [allProjectIds])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const payload: LegendSelection = { selectedIds: visibleIds }
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore persistence errors
    }
  }, [visibleIds])

  const data = React.useMemo<RechartsBucketDatum[]>(() => {
    return buckets.map((bucket) => {
      const bucketKey = formatBucketKey(bucket)
      const datum: RechartsBucketDatum = {
        bucketKey,
        start: bucket.start,
        end: bucket.end,
      }
      for (const projectId of Object.keys(projectTotals)) {
        datum[projectId] = bucket.perProject[projectId] ?? 0
      }
      return datum
    })
  }, [buckets, projectTotals])

  const colorByProject = React.useMemo(() => {
    const mapping: Record<string, string> = {}
    allProjectIds.forEach((id, index) => {
      mapping[id] = rechartsPalette[index % rechartsPalette.length]
    })
    return mapping
  }, [allProjectIds])

  const handleToggle = (projectId: string) => {
    setVisibleIds((prev) => {
      return prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    })
  }

  if (buckets.length === 0) {
    return (
      <div className="w-full min-h-[160px] max-h-[40vh] flex items-center justify-center" aria-label="Cost over time per project">
        <p className="text-sm opacity-70">No cost data yet</p>
      </div>
    )
  }

  return (
    <section
      className="w-full flex flex-col md:flex-row gap-4 min-h-[160px] max-h-[40vh]"
      aria-label="Cost over time per project"
    >
      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucketKey" />
            <YAxis />
            <Tooltip content={<CostChartTooltip projectsMeta={projectsMeta} />} />
            {allProjectIds.map((projectId) => (
              visibleIds.includes(projectId) && (
                <Bar
                  key={projectId}
                  dataKey={projectId}
                  stackId="cost"
                  fill={colorByProject[projectId]}
                />
              )
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="md:w-64 w-full flex-shrink-0 overflow-y-auto">
        <ul className="flex md:flex-col flex-row flex-wrap gap-2 md:gap-1">
          {allProjectIds.map((projectId) => {
            const isSelected = visibleIds.includes(projectId)
            const name = projectsMeta[projectId]?.name ?? projectId
            const total = projectTotals[projectId] ?? 0
            return (
              <li key={projectId} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`btn btn-xs md:btn-sm justify-start ${isSelected ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => handleToggle(projectId)}
                  aria-pressed={isSelected}
                >
                  <span
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: colorByProject[projectId] }}
                    aria-hidden="true"
                  />
                  <span className="truncate max-w-[10rem] md:max-w-[8rem]" title={name}>{name}</span>
                  <span className="ml-2 tabular-nums text-xs opacity-70">{total.toFixed(2)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
  projectsMeta: Record<string, CostChartProjectMeta>
}

const CostChartTooltip: React.FC<TooltipProps> = ({ active, payload, label, projectsMeta }) => {
  if (!active || !payload || payload.length === 0) return null

  const total = payload.reduce((sum, entry) => sum + (typeof entry.value === "number" ? entry.value : 0), 0)

  return (
    <div className="rounded bg-base-100 shadow-lg p-3 text-sm">
      <div className="font-semibold mb-1">{label}</div>
      <ul className="space-y-0.5">
        {payload.map((entry) => {
          const projectId = entry.dataKey
          const name = projectsMeta[projectId]?.name ?? projectId
          const value = typeof entry.value === "number" ? entry.value : 0
          return (
            <li key={projectId} className="flex justify-between gap-4">
              <span className="truncate" title={name}>{name}</span>
              <span className="tabular-nums">{value.toFixed(2)}</span>
            </li>
          )
        })}
      </ul>
      <div className="mt-2 border-t border-base-300 pt-1 flex justify-between">
        <span className="font-semibold">Total</span>
        <span className="tabular-nums font-semibold">{total.toFixed(2)}</span>
      </div>
    </div>
  )
}

function formatBucketKey(bucket: CostBucket): string {
  const start = bucket.start
  const end = bucket.end
  const spanMs = end.getTime() - start.getTime()
  const hourMs = 60 * 60 * 1000
  const dayMs = 24 * hourMs
  const weekMs = 7 * dayMs

  if (spanMs <= hourMs) {
    return start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }
  if (spanMs <= dayMs) {
    return start.toISOString().slice(0, 10)
  }
  if (spanMs <= weekMs) {
    return `${start.toISOString().slice(0, 10)} – ${end.toISOString().slice(0, 10)}`
  }
  return start.toLocaleString(undefined, { month: "short", year: "numeric" })
}
