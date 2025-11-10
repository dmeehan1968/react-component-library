import type { TestType } from "@playwright/experimental-ct-core"
import { type ComponentFixtures, expect, test as baseTest } from "@playwright/experimental-ct-react"
import { downArrow, ProjectTableViewHelper, upArrow } from "./index.ctspec.helper.tsx"
import { type Project, ProjectTableView } from "./index.tsx"

baseTest.describe("ProjectTableView", () => {

  baseTest.describe("no data", () => {

    const projects: Project[] = []

    const test = baseTest.extend<{ table: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        await provide(new ProjectTableViewHelper(
          await mount(<ProjectTableView projects={projects}/>),
          projects,
        ))
      },
    })

    commonProjectTableSuite(test)

    test('should contain no data message when empty', async ({ table }) => {
      await expect(table.noDataMessage).toHaveCount(1)
      await expect(table.noDataMessage).toHaveText(/no projects found/i)
    })

  })

  baseTest.describe("with data", () => {
    const projects: Project[] = [
      { name: 'Project 1', lastUpdated: new Date('2025/01/02 12:00:00'), issueCount: 10 },
      { name: 'Project 2', lastUpdated: new Date('2025/01/01 12:00:00'), issueCount: 5 },
      { name: 'Project 3', lastUpdated: new Date('2025/01/03 12:00:00'), issueCount: 0 },
    ]

    const test = baseTest.extend<{ table: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        await provide(new ProjectTableViewHelper(
          await mount(<ProjectTableView projects={projects}/>),
          projects,
        ))
      },
    })

    commonProjectTableSuite(test)

    test('should contain rows for each project', async ({ table }) => {
      await expect(table.projectRows).toHaveCount(table.fixtures.length)
    })

  })

})

function commonProjectTableSuite<T extends TestType<ComponentFixtures & {
  table: ProjectTableViewHelper
}>>(test: T) {
  test('should render a table', async ({ table }) => {
    await expect(table.tagName).resolves.toEqual('TABLE')
  })

  test('should contain name column', async ({ table }) => {
    await expect(table.nameColumn).toHaveCount(1)
  })

  test('should contain last updated column', async ({ table }) => {
    await expect(table.lastUpdatedColumn).toHaveCount(1)
  })

  test('should contain issue count column', async ({ table }) => {
    await expect(table.issueCountColumn).toHaveCount(1)
  })

  test('name column header should be sortable', async ({ table }) => {

    const initial = await table.projectNamesAsRendered()
    expect(initial).toEqual(table.projectNamesInOrder('name', 'asc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: upArrow, lastUpdated: undefined })

    await table.nameColumn.click()

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.projectNamesInOrder('name', 'desc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: downArrow, lastUpdated: undefined })

  })

  test('lastUpdated column header should be sortable', async ({ table }) => {

    const initial = await table.projectNamesAsRendered()
    expect(initial).toEqual(table.projectNamesInOrder('name', 'asc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: upArrow, lastUpdated: undefined })

    await table.lastUpdatedColumn.click()

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.projectNamesInOrder('lastUpdated', 'asc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: undefined, lastUpdated: upArrow })

    await table.lastUpdatedColumn.click()

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.projectNamesInOrder('lastUpdated', 'desc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: undefined, lastUpdated: downArrow })

  })

  test('when the name column is sorted, the last updated column should not show a sort indicator', async ({ table }) => {

    await expect.poll(() => table.sortIndicators).toEqual({ name: upArrow, lastUpdated: undefined })

  })

  test('when the lastUpdated column is sorted, the name column should not show a sort indicator', async ({ table }) => {

    await table.lastUpdatedColumn.click()
    await expect.poll(() => table.sortIndicators).toEqual({ name: undefined, lastUpdated: upArrow })

  })

}

