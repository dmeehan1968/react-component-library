import type { Project } from "./projectsContext.tsx"
import type { SortOrder } from "./projectsProvider.tsx"

export const byName = (projects: Project[], order: SortOrder) => [...projects].sort((a, b) => a.name.localeCompare(b.name) * (order === 'asc' ? 1 : -1))
export const byLastUpdated = (projects: Project[], order: SortOrder) => [...projects].sort((a, b) => (a.lastUpdated.getTime() - b.lastUpdated.getTime()) * (order === 'asc' ? 1 : -1))