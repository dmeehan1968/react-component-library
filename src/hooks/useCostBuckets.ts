import * as React from "react"
import type { FetchImpl } from "../providers/projectsProvider.tsx"
import type { IssueModel } from "../schemas/issue.ts"
import { parseIssues } from "../schemas/issue.ts"

export interface CostBucket {
  start: Date
  end: Date
  totalCost: number
  perProject: Record<string, number>
}

export interface UseCostBucketsResult {
  buckets: CostBucket[]
  projectTotals: Record<string, number>
  isLoading: boolean
  error?: string
}

type BucketUnit = "hour" | "day" | "week" | "month"

interface BucketConfig {
  unit: BucketUnit
  count: number
  start: Date
}

export interface UseCostBucketsOptions {
  fetchImpl?: FetchImpl
}

export function useCostBuckets(projectIds: string[], options?: UseCostBucketsOptions): UseCostBucketsResult {
  const fetchImpl = options?.fetchImpl ?? fetch

  const [state, setState] = React.useState<UseCostBucketsResult>({
    buckets: [],
    projectTotals: {},
    isLoading: false,
  })

  React.useEffect(() => {
    if (projectIds.length === 0) {
      setState({ buckets: [], projectTotals: {}, isLoading: false })
      return
    }

    let cancelled = false

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }))
      try {
        const allIssues: IssueModel[] = []

        for (const projectId of projectIds) {
          const res = await fetchImpl(`/api/projects/${encodeURIComponent(projectId)}/issues`)
          if (!res.ok) {
            continue
          }
          const raw = await res.json()
          const parsed = parseIssues(raw)
          allIssues.push(...parsed)
        }

        if (allIssues.length === 0) {
          if (!cancelled) {
            setState({ buckets: [], projectTotals: {}, isLoading: false })
          }
          return
        }

        const timestamps = allIssues.map((i) => i.timestamp.getTime())
        const minTimestamp = Math.min(...timestamps)
        const maxTimestamp = Math.max(...timestamps)

        const bucketConfig = chooseBucketConfig(minTimestamp, maxTimestamp)
        const buckets = buildBuckets(bucketConfig)

        const projectTotals: Record<string, number> = {}

        for (const issue of allIssues) {
          const ts = issue.timestamp.getTime()
          const project = issue.project
          const idx = findBucketIndex(bucketConfig, ts)
          if (idx < 0 || idx >= buckets.length) continue

          const bucket = buckets[idx]
          const prev = bucket.perProject[project] ?? 0
          const next = prev + issue.cost
          bucket.perProject[project] = next
          bucket.totalCost += issue.cost

          projectTotals[project] = (projectTotals[project] ?? 0) + issue.cost
        }

        if (!cancelled) {
          setState({ buckets, projectTotals, isLoading: false })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ buckets: [], projectTotals: {}, isLoading: false, error: err instanceof Error ? err.message : String(err) })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [fetchImpl, projectIds])

  return state
}

function chooseBucketConfig(minTimestamp: number, maxTimestamp: number): BucketConfig {
  const spanMs = Math.max(maxTimestamp - minTimestamp, 0)

  const hourMs = 60 * 60 * 1000
  const dayMs = 24 * hourMs
  const weekMs = 7 * dayMs

  const hourCount = Math.ceil(spanMs / hourMs) || 1
  const dayCount = Math.ceil(spanMs / dayMs) || 1
  const weekCount = Math.ceil(spanMs / weekMs) || 1
  const monthCount = calendarMonthDiffInclusive(new Date(minTimestamp), new Date(maxTimestamp)) || 1

  const candidates: { unit: BucketUnit; count: number }[] = [
    { unit: "hour", count: hourCount },
    { unit: "day", count: dayCount },
    { unit: "week", count: weekCount },
    { unit: "month", count: monthCount },
  ]

  for (const c of candidates) {
    if (c.count <= 12 && c.count >= 4) {
      return {
        unit: c.unit,
        count: c.count,
        start: alignToUnitBoundary(new Date(minTimestamp), c.unit),
      }
    }
  }

  if (hourCount < 4) {
    return {
      unit: "hour",
      count: hourCount,
      start: alignToUnitBoundary(new Date(minTimestamp), "hour"),
    }
  }

  return {
    unit: "month",
    count: monthCount,
    start: alignToUnitBoundary(new Date(minTimestamp), "month"),
  }
}

function buildBuckets(config: BucketConfig): CostBucket[] {
  const buckets: CostBucket[] = []
  let cursor = config.start

  for (let i = 0; i < config.count; i += 1) {
    const end = addUnit(cursor, config.unit, 1)
    buckets.push({
      start: cursor,
      end,
      totalCost: 0,
      perProject: {},
    })
    cursor = end
  }

  return buckets
}

function findBucketIndex(config: BucketConfig, timestamp: number): number {
  const start = config.start.getTime()
  const date = new Date(timestamp)

  if (timestamp < start) {
    return -1
  }

  switch (config.unit) {
    case "hour": {
      const hourMs = 60 * 60 * 1000
      return Math.floor((timestamp - start) / hourMs)
    }
    case "day": {
      const dayMs = 24 * 60 * 60 * 1000
      return Math.floor((timestamp - start) / dayMs)
    }
    case "week": {
      const weekMs = 7 * 24 * 60 * 60 * 1000
      return Math.floor((timestamp - start) / weekMs)
    }
    case "month": {
      const monthsDiff = calendarMonthDiffInclusive(config.start, date)
      return monthsDiff - 1
    }
  }
}

function alignToUnitBoundary(date: Date, unit: BucketUnit): Date {
  const d = new Date(date.getTime())
  switch (unit) {
    case "hour":
      d.setMinutes(0, 0, 0)
      return d
    case "day":
      d.setHours(0, 0, 0, 0)
      return d
    case "week": {
      const day = d.getDay()
      const diffToMonday = (day + 6) % 7
      d.setDate(d.getDate() - diffToMonday)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case "month":
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      return d
  }
}

function addUnit(date: Date, unit: BucketUnit, amount: number): Date {
  const d = new Date(date.getTime())
  switch (unit) {
    case "hour":
      d.setHours(d.getHours() + amount)
      return d
    case "day":
      d.setDate(d.getDate() + amount)
      return d
    case "week":
      d.setDate(d.getDate() + 7 * amount)
      return d
    case "month":
      d.setMonth(d.getMonth() + amount)
      return d
  }
}

function calendarMonthDiffInclusive(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12
  months += end.getMonth() - start.getMonth()
  return months + 1
}
