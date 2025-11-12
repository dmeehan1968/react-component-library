import * as React from "react"

export type SortOrder = 'asc' | 'desc'

type IndicatorTriple = { asc?: string; desc?: string; none?: string }

export interface UseSortOptions<K extends string> {
  initial?: { column: K; order: SortOrder }
  // Either a single global indicator config or per-column overrides
  indicators?: IndicatorTriple | Partial<Record<K, IndicatorTriple>>
}

export interface UseSortResult<T, K extends string> {
  sort: { column: K; order: SortOrder }
  setSort: React.Dispatch<React.SetStateAction<{ column: K; order: SortOrder }>>
  handleSort: (column: K) => () => void
  indicator: Record<K, string>
  sorted: T[]
}

// Type guards to discriminate `indicators` union without using `any`
const hasIndicatorKeys = (i: unknown): i is IndicatorTriple =>
  typeof i === 'object' && i !== null && ('asc' in i || 'desc' in i || 'none' in i)

function isPerColumnIndicators<K extends string>(i: unknown): i is Partial<Record<K, IndicatorTriple>> {
  return typeof i === 'object' && i !== null && !hasIndicatorKeys(i)
}

/**
 * Generic sorting hook.
 * - Strongly types `handleSort` to accepted column keys.
 * - Computes per-column indicators with configurable symbols.
 * - Returns the `sorted` array derived from input `data` via the provided `sortFn`.
 */
export function useColumnSort<T, const K extends string>(
  data: readonly T[],
  columns: readonly K[],
  sortFn: (items: readonly T[], by: K, order: SortOrder) => T[],
  options: UseSortOptions<K> = {},
): UseSortResult<T, K> {
  const { initial, indicators } = options

  const [sort, setSort] = React.useState<{ column: K; order: SortOrder }>(() => {
    if (initial) return initial
    // default to first column if provided
    const first = columns[0]
    return { column: first, order: 'asc' }
  })

  const handleSort = React.useCallback((column: K) => {
    return () =>
      setSort((prev) =>
        prev.column === column ? { column, order: prev.order === 'asc' ? 'desc' : 'asc' } : { column, order: 'asc' },
      )
  }, [])

  const sorted = React.useMemo(() => {
    return sortFn(data, sort.column, sort.order)
  }, [data, sort, sortFn])

  const indicator = React.useMemo(() => {
    const compute = (col: K): string => {
      const base: IndicatorTriple = Array.isArray(columns)
        ? isPerColumnIndicators(indicators)
          ? indicators[col] ?? {}
          : (indicators ?? {})
        : (indicators ?? {})
      const asc = base.asc ?? '↑'
      const desc = base.desc ?? '↓'
      const none = base.none ?? ''
      if (sort.column !== col) return none
      return sort.order === 'asc' ? asc : desc
    }
    return columns.reduce((acc, col) => {
      acc[col] = compute(col)
      return acc
    }, {} as Record<K, string>)
  }, [columns, indicators, sort])

  return { sort, setSort, handleSort, indicator, sorted: sorted as T[] }
}
