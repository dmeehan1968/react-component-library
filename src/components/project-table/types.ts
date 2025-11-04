export type SortBy = 'name' | 'updatedAt'
export type SortDir = 'asc' | 'desc'

export type ProjectRow = {
  id: string
  name: string
  href: string
  updatedAt: Date
  issueCount: number
  selected?: boolean
}

export interface ProjectTableProps {
  rows: ProjectRow[]
  onRowsChange?: (next: ProjectRow[]) => void
  sortBy?: SortBy
  sortDir?: SortDir
  defaultSortBy?: SortBy
  defaultSortDir?: SortDir
  onSortChange?: (next: { sortBy: SortBy; sortDir: SortDir }) => void
  formatDate?: (value: Date) => string
}
