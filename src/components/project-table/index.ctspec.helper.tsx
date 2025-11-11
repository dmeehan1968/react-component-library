import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import type { Project } from "../../providers/projectsContext.tsx"
import {
  ProjectsProvider,
  type ProjectsProviderProps,
  type SortableColumns,
  type SortOrder,
} from "../../providers/projectsProvider.tsx"

import {
  errorMessageId,
  issueCountColumnId,
  lastUpdatedColumnId,
  loadingMessageId,
  nameColumnId,
  noDataMessageId,
  projectId,
  sortIndicatorId,
} from "./index.testids.ts"
import { ProjectTableView } from "./index.tsx"

export const upArrow = '↑' as const
export const downArrow = '↓' as const

export class ProjectTableViewHelper {
  readonly fixtures: Project[]
  private _root: MountResult | undefined
  private readonly _mount: ComponentFixtures['mount']

  constructor(mount: ComponentFixtures['mount'], projects: Project[]) {
    this._mount = mount
    this.fixtures = projects
  }

  get root(): Locator {
    if (!this._root) {
      throw new Error('ProjectTableViewHelper not mounted')
    }
    return this._root
  }

  async mount(props: ProjectsProviderProps) {
    if (this._root) {
      await this._root.unmount()
    }
    this._root = await this._mount(
      <ProjectsProvider {...props}>
        <ProjectTableView/>
      </ProjectsProvider>
    )
  }

  projectNamesAsRendered() {
    return this.root.getByTestId(projectId).locator('td:first-child').allTextContents()
  }

  projectNamesInOrder(by: SortableColumns, order: SortOrder) {
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
    return this.root.getByTestId(nameColumnId)
  }

  get lastUpdatedColumn() {
    return this.root.getByTestId(lastUpdatedColumnId)
  }

  get issueCountColumn() {
    return this.root.getByTestId(issueCountColumnId)
  }

  get tagName() {
    return this.root.evaluate(el => el.tagName)
  }

  get projectRows() {
    return this.root.getByTestId(projectId)
  }

  get sortIndicators(): Promise<{ name: string | undefined, lastUpdated: string | undefined }> {
    return (async () => {
      const name = await this.nameColumn.getByTestId(sortIndicatorId).textContent()
      const lastUpdated = await this.lastUpdatedColumn.getByTestId(sortIndicatorId).textContent()
      return {
        name: name ? name.trim() : undefined,
        lastUpdated: lastUpdated ? lastUpdated.trim() : undefined,
      }
    })()
  }

  get noDataMessage() {
    return this.root.getByTestId(noDataMessageId)
  }

  get loadingMessage() {
    return this.root.getByTestId(loadingMessageId)
  }

  get errorMessage() {
    return this.root.getByTestId(errorMessageId)
  }
}