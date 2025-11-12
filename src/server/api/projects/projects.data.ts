export interface ProjectDTO {
  name: string
  url: string
  lastUpdated: string
  issueCount: number
}

export const projectsData: ProjectDTO[] = [
  {
    name: "React Component Library",
    url: "/projects/react-component-library/issues",
    lastUpdated: "2025-11-12T13:34:00.000Z",
    issueCount: 10,
  },
  {
    name: "Design Tokens",
    url: "/projects/design-tokens/issues",
    lastUpdated: "2025-11-12T13:34:00.000Z",
    issueCount: 10,
  },
  {
    name: "Docs Site",
    url: "/projects/docs-site/issues",
    lastUpdated: "2025-11-12T13:34:00.000Z",
    issueCount: 10,
  },
  {
    name: "Storybook",
    url: "/projects/storybook/issues",
    lastUpdated: "2025-11-12T13:34:00.000Z",
    issueCount: 10,
  },
  {
    name: "CI Pipeline",
    url: "/projects/ci-pipeline/issues",
    lastUpdated: "2025-11-12T13:34:00.000Z",
    issueCount: 10,
  },
  {
    name: "Icon Pack",
    url: "/projects/icon-pack/issues",
    lastUpdated: "2025-11-12T13:34:00.000Z",
    issueCount: 10,
  },
]
