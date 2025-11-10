import type { Locator } from "@playwright/test"
import type { Project } from "../../providers/projectsContext.tsx"

import {
  errorMessage,
  issueCountColumn,
  lastUpdatedColumn,
  loadingMessage,
  nameColumn,
  noDataMessage,
  project,
  sortIndicator,
} from "./index.testids.ts"

type sortableColumns = 'name' | 'lastUpdated'
type sortOrder = 'asc' | 'desc'
export const upArrow = '↑' as const
export const downArrow = '↓' as const

export class ProjectTableViewHelper {
  readonly fixtures: Project[]
  private readonly root: Locator

  constructor(root: Locator, projects: Project[]) {
    this.root = root
    this.fixtures = projects
  }

  projectNamesAsRendered() {
    return this.root.getByTestId(project).locator('td:first-child').allTextContents()
  }

  projectNamesInOrder(by: sortableColumns, order: sortOrder) {
    return [...this.fixtures].sort((a, b) => {
      if (by === 'name') {
        return order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      } else {
        return order === 'asc'
          ? a.lastUpdated.getTime() - b.lastUpdated.getTime()
          : b.lastUpdated.getTime() - a.lastUpdated.getTime()
      }
    }).map(p => p.name)
  }

  get nameColumn() {
    return this.root.getByTestId(nameColumn)
  }

  get lastUpdatedColumn() {
    return this.root.getByTestId(lastUpdatedColumn)
  }

  get issueCountColumn() {
    return this.root.getByTestId(issueCountColumn)
  }

  get tagName() {
    return this.root.evaluate(el => el.tagName)
  }

  get projectRows() {
    return this.root.getByTestId(project)
  }

  get sortIndicators(): Promise<{ name: string | undefined, lastUpdated: string | undefined }> {
    return (async () => {
      const name = await this.nameColumn.getByTestId(sortIndicator).textContent()
      const lastUpdated = await this.lastUpdatedColumn.getByTestId(sortIndicator).textContent()
      return {
        name: name ? name.trim() : undefined,
        lastUpdated: lastUpdated ? lastUpdated.trim() : undefined,
      }
    })()
  }

  get noDataMessage() {
    return this.root.getByTestId(noDataMessage)
  }

  get loadingMessage() {
    return this.root.getByTestId(loadingMessage)
  }

  get errorMessage() {
    return this.root.getByTestId(errorMessage)
  }
}