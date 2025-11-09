import type { TestType } from "@playwright/experimental-ct-core"
import { type ComponentFixtures, expect, test as baseTest } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import { issueCountColumn, lastUpdatedColumn, name, nameColumn, noDataMessage, project } from "./index.testids.ts"
import {
  type Project,
  ProjectTableView,
} from "./index.tsx"

baseTest.describe("ProjectTableView", () => {

  baseTest.describe("no data", () => {

    const projects: Project[] = []

    const test = baseTest.extend<{ table: Locator }>({
      table: async ({ mount }, provide) => {
        await provide(await mount(<ProjectTableView projects={projects}/>))
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

    const test = baseTest.extend<{ table: Locator }>({
      table: async ({ mount }, provide) => {
        await provide(await mount(<ProjectTableView projects={projects}/>))
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

  test('lastUpdated column header should be sortable', async ({ table }) => {
    const initialNames = await getProjectNames(table)
    expect(initialNames).toEqual(projects.map(p => p.name))

    await table.getByTestId(lastUpdatedColumn).click()
    // should be ascending sorted after changing from name sort
    await expect.poll(() => getProjectNames(table)).toEqual(projects.toSorted((a, b) => {
      return a.lastUpdated.getTime() - b.lastUpdated.getTime()
    }).map(p => p.name))

    await expect(table.getByTestId(lastUpdatedColumn)).toContainText(/↑/i)

    // should be descending sorted after last column click
    await table.getByTestId(lastUpdatedColumn).click()
    await expect.poll(() => getProjectNames(table)).toEqual(projects.toSorted((a, b) => {
      return b.lastUpdated.getTime() - a.lastUpdated.getTime()
    }).map(p => p.name))

    await expect(table.getByTestId(lastUpdatedColumn)).toContainText(/↓/i)

  })

}