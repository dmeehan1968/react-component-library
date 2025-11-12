export interface ProjectDTO {
  name: string
  url: string
  lastUpdated: string
  issueCount: number
}

export const projectsData: ProjectDTO[] = [
  {
    name: "React Component Library",
    url: "https://github.com/example/react-component-library",
    lastUpdated: "2025-10-15T10:30:00.000Z",
    issueCount: 12,
  },
  {
    name: "Design Tokens",
    url: "https://github.com/example/design-tokens",
    lastUpdated: "2025-09-28T14:05:00.000Z",
    issueCount: 5,
  },
  {
    name: "Docs Site",
    url: "https://github.com/example/docs-site",
    lastUpdated: "2025-11-01T08:00:00.000Z",
    issueCount: 0,
  },
]
