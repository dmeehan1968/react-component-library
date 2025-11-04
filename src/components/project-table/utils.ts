import type { ProjectRow, SortBy, SortDir } from './types'

export function triState(selectedCount: number, total: number): 'all' | 'some' | 'none' {
  if (total === 0 || selectedCount === 0) return 'none'
  if (selectedCount === total) return 'all'
  return 'some'
}

export function formatAsYmdHm(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`
}

export function sortRows(rows: ProjectRow[], by: SortBy, dir: SortDir): ProjectRow[] {
  const sign = dir === 'asc' ? 1 : -1
  // stable sort using decorate-sort-undecorate pattern
  return rows
    .map((row, idx) => ({ row, idx }))
    .sort((a, b) => {
      let cmp = 0
      if (by === 'name') {
        cmp = a.row.name.localeCompare(b.row.name)
      } else {
        const at = a.row.updatedAt.getTime()
        const bt = b.row.updatedAt.getTime()
        cmp = at === bt ? 0 : at < bt ? -1 : 1
      }
      if (cmp === 0) cmp = a.idx - b.idx
      return cmp * sign
    })
    .map((x) => x.row)
}
