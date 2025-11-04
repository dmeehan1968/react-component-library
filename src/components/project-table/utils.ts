import type { ProjectRow } from './types.ts'

export type TriState = 'all' | 'some' | 'none'

export function triState(selectedCount: number, total: number): TriState {
  if (total <= 0) return 'none'
  if (selectedCount <= 0) return 'none'
  if (selectedCount >= total) return 'all'
  return 'some'
}

function cmpStr(a: string, b: string) {
  return a.localeCompare(b)
}

export function formatAsYmdHm(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${d} ${hh}:${mm}`
}

export function sortRows(
  rows: ProjectRow[],
  by: 'name' | 'updatedAt',
  dir: 'asc' | 'desc',
): ProjectRow[] {
  const factor = dir === 'asc' ? 1 : -1
  // stable sort using index as tiebreaker
  return [...rows]
    .map((row, idx) => ({ row, idx }))
    .sort((a, b) => {
      let res = 0
      if (by === 'name') res = cmpStr(a.row.name, b.row.name)
      else if (by === 'updatedAt') res = a.row.updatedAt.getTime() - b.row.updatedAt.getTime()
      if (res === 0) return a.idx - b.idx
      return res * factor
    })
    .map(({ row }) => row)
}
