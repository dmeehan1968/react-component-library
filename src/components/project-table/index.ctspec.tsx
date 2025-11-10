import type { TestType } from "@playwright/experimental-ct-core"
import { type ComponentFixtures, expect, test as baseTest } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import {
  issueCountColumn,
  lastUpdatedColumn,
  name,
  nameColumn,
  noDataMessage,
  project,
  sortIndicator,
} from "./index.testids.ts"
import {
  type Project,
  ProjectTableView,
} from "./index.tsx"

type sortableColumns = 'name' | 'lastUpdated'
type sortOrder = 'asc' | 'desc'
const upArrow = '↑' as const
const downArrow = '↓' as const

class ProjectTableViewHelper {
  private readonly projects: Project[]
  private readonly root: Locator

  constructor(root: Locator, projects: Project[]) {
    this.root = root
    this.projects = projects
  }

  projectNamesAsRendered() {
    return this.root.getByTestId(project).locator('td:first-child').allTextContents()
  }
  
  projectNamesInOrder(by: sortableColumns, order: sortOrder) {
    return [...this.projects].sort((a, b) => {
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

  get lastUpdatedColumn() {
    return this.root.getByTestId(lastUpdatedColumn)
  }

  async getSortIndicators(): Promise<{ name: string | undefined, lastUpdated: string | undefined }> {
    const name = await this.root.getByTestId(nameColumn).getByTestId(sortIndicator).textContent()
    const lastUpdated = await this.root.getByTestId(lastUpdatedColumn).getByTestId(sortIndicator).textContent()

    return {
      name: name ? name.trim() : undefined,
      lastUpdated: lastUpdated ? lastUpdated.trim() : undefined,
    }
  }
}

baseTest.describe("ProjectTableView", () => {

  baseTest.describe("no data", () => {

    const projects: Project[] = []

    const test = baseTest.extend<{ table: Locator, dsl: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        await provide(await mount(<ProjectTableView projects={projects}/>))
      },
      dsl: async ({ table }, provide) => {
        await provide(new ProjectTableViewHelper(table, projects))
      },
    })

    commonProjectTableSuite(projects, test)

    test('should contain no data message when empty', async ({ table }) => {
      const message = table.getByTestId(noDataMessage)
      expect(await message.count()).toEqual(1)
      expect(await message.textContent()).toMatch(/no projects found/i)
    })

  })

  baseTest.describe("with data", () => {
    const projects: Project[] = [
      { name: 'Project 1', lastUpdated: new Date('2025/01/02 12:00:00'), issueCount: 10 },
      { name: 'Project 2', lastUpdated: new Date('2025/01/01 12:00:00'), issueCount: 5 },
      { name: 'Project 3', lastUpdated: new Date('2025/01/03 12:00:00'), issueCount: 0 },
    ]

    const test = baseTest.extend<{ table: Locator, dsl: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        await provide(await mount(<ProjectTableView projects={projects}/>))
      },
      dsl: async ({ table }, provide) => {
        await provide(new ProjectTableViewHelper(table, projects))
      },
    })

    commonProjectTableSuite(projects, test)

    test('should contain rows for each project', async ({ mount }) => {
      const table = await mount(<ProjectTableView projects={projects}/>)
      expect(await table.getByTestId(project).count()).toEqual(projects.length)
    })

  })

})

function commonProjectTableSuite<T extends TestType<ComponentFixtures & {
  table: Locator
  dsl: ProjectTableViewHelper
}>>(projects: Project[], test: T) {
  test('should render a table', async ({ table }) => {
    const tagName = await table.evaluate(el => el.tagName)
    expect(tagName).toEqual('TABLE')
  })

  test('should contain name column', async ({ table }) => {
    expect(await table.getByTestId(nameColumn).count()).toEqual(1)
  })

  test('should contain last updated column', async ({ table }) => {
    expect(await table.getByTestId(lastUpdatedColumn).count()).toEqual(1)
  })

  test('should contain issue count column', async ({ table }) => {
    expect(await table.getByTestId(issueCountColumn).count()).toEqual(1)
  })

  const getProjectNames = async (table: Locator) => {
    return table.getByTestId(name).allTextContents()
  }

  test('name column header should be sortable', async ({ table }) => {

    const initialNames = await getProjectNames(table)
    expect(initialNames).toEqual(projects.map(p => p.name))

    await expect(table.getByTestId(nameColumn)).toContainText(/↑/i)

    await table.getByTestId(nameColumn).click()

    await expect.poll(() => getProjectNames(table)).toEqual(projects.map(p => p.name).reverse())

    await expect(table.getByTestId(nameColumn)).toContainText(/↓/i)
  })

  test('lastUpdated column header should be sortable', async ({ dsl }) => {

    const initial = await dsl.projectNamesAsRendered()
    expect(initial).toEqual(dsl.projectNamesInOrder('name', 'asc'))
    await expect.poll(() => dsl.getSortIndicators()).toEqual({ name: upArrow, lastUpdated: undefined })

    await dsl.lastUpdatedColumn.click()

    await expect.poll(() => dsl.projectNamesAsRendered()).toEqual(dsl.projectNamesInOrder('lastUpdated', 'asc'))
    await expect.poll(() => dsl.getSortIndicators()).toEqual({ name: undefined, lastUpdated: upArrow })

    await dsl.lastUpdatedColumn.click()

    await expect.poll(() => dsl.projectNamesAsRendered()).toEqual(dsl.projectNamesInOrder('lastUpdated', 'desc'))
    await expect.poll(() => dsl.getSortIndicators()).toEqual({ name: undefined, lastUpdated: downArrow })

  })

  test('when the name column is sorted, the last updated column should not show a sort indicator', async ({ dsl }) => {

    await expect.poll(() => dsl.getSortIndicators()).toEqual({ name: upArrow, lastUpdated: undefined })

  })

  test('when the lastUpdated column is sorted, the name column should not show a sort indicator', async ({ dsl }) => {

    await dsl.lastUpdatedColumn.click()
    await expect.poll(() => dsl.getSortIndicators()).toEqual({ name: undefined, lastUpdated: upArrow })

  })

}

