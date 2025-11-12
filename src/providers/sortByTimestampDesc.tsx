import type { Issue } from "./issuesContext.tsx"

export const sortByTimestampDesc = (issues: Issue[]) =>
  [...issues].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())