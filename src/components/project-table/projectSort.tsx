import type { Project } from "../../providers/projectsContext.tsx"
import type { SortOrder } from "../../hooks/useColumnSort.ts"

export type ProjectSortableColumns = 'name' | 'lastUpdated'

const byName = (projects: readonly Project[], order: SortOrder) =>
  [...projects].sort((a, b) => a.name.localeCompare(b.name) * (order === 'asc' ? 1 : -1))

const byLastUpdated = (projects: readonly Project[], order: SortOrder) =>
  [...projects].sort((a, b) => (a.lastUpdated.getTime() - b.lastUpdated.getTime()) * (order === 'asc' ? 1 : -1))

export const projectSort = (projects: readonly Project[], by: ProjectSortableColumns, order: SortOrder) => {
  switch (by) {
    case 'name':
      return byName(projects, order)
    case 'lastUpdated':
      return byLastUpdated(projects, order)
    default:
      throw new Error(`invalid sort by: ${by}`)
  }
}