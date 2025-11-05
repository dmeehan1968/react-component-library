import type { ProjectRow } from "./types.ts"

export type TriState = 'all' | 'some' | 'none'

export function triState(selectedCount: number, total: number): TriState {
  if (total <= 0) return 'none'
  if (selectedCount <= 0) return 'none'
  if (selectedCount >= total) return 'all'
  return 'some'
}

export function sortRows(rows: ProjectRow[], by: 'name' | 'updatedAt', dir: 'asc' | 'desc'): ProjectRow[] {
  const factor = dir === 'asc' ? 1 : -1
  // stable sort by including original index as a tiebreaker
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      let cmp = 0
      if (by === 'name') {
        cmp = a.r.name.localeCompare(b.r.name)
      } else {
        cmp = a.r.updatedAt.getTime() - b.r.updatedAt.getTime()
      }
      if (cmp === 0) cmp = a.i - b.i
      return cmp * factor
    })
    .map((x) => x.r)
}

function pad2(n: number): string { return n.toString().padStart(2, '0') }

// YYYY/MM/DD HH:MM (24-hour)
export function formatAsYmdHm(date: Date): string {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  const hh = pad2(date.getHours())
  const mm = pad2(date.getMinutes())
  return `${y}/${m}/${d} ${hh}:${mm}`
}
