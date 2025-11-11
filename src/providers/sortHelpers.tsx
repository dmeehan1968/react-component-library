import type { Project } from "./projectsContext.tsx"
import type { SortableColumns, SortOrder } from "./projectsProvider.tsx"

const byName = (projects: Project[], order: SortOrder) =>
  [...projects].sort((a, b) => a.name.localeCompare(b.name) * (order === 'asc' ? 1 : -1))

const byLastUpdated = (projects: Project[], order: SortOrder) =>
  [...projects].sort((a, b) => (a.lastUpdated.getTime() - b.lastUpdated.getTime()) * (order === 'asc' ? 1 : -1))

export const projectSort = (projects: Project[], by: SortableColumns, order: SortOrder) => {
  switch (by) {
    case 'name':
      return byName(projects, order)
    case 'lastUpdated':
      return byLastUpdated(projects, order)
    default:
      return projects
  }
}