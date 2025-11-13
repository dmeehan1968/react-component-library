import type { TestType } from "@playwright/experimental-ct-core"
import { type ComponentFixtures, expect, test as baseTest } from "@playwright/experimental-ct-react"
import type { Project } from "../../providers/projectsContext.tsx"

import { downArrow, ProjectTableViewHelper, upArrow } from "./index.ctspec.helper.tsx"
import { T as ids } from "./index.testids.ts"

baseTest.describe("ProjectTableView", () => {

  baseTest.describe("no data", () => {

    const projects: Project[] = []
    const test = baseTest.extend<{ table: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new ProjectTableViewHelper(mount, projects)
        await helper.mount({ projects })
        await provide(helper)
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
      { name: 'Project 1', url: '/p1', lastUpdated: new Date('2025/01/02 12:00:00'), issueCount: 10 },
      { name: 'Project 2', url: '/p2', lastUpdated: new Date('2025/01/01 12:00:00'), issueCount: 5 },
      { name: 'Project 3', url: '/p3', lastUpdated: new Date('2025/01/03 12:00:00'), issueCount: 0 },
    ]

    const test = baseTest.extend<{ table: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new ProjectTableViewHelper(mount, projects)
        await helper.mount({ projects })
        await provide(helper)
      },
    })

    commonProjectTableSuite(test)

    test('should contain rows for each project', async ({ table }) => {
      await expect(table.projectRows).toHaveCount(table.fixtures.length)
    })

    test('should render project names as links with correct href', async ({ table }) => {
      // default sort is by name asc
      const expectedNames = table.fixtureNamesInOrder('name', 'asc')
      const expectedUrls = table.fixtureUrlsInOrder('name', 'asc')

      await expect.poll(() => table.projectNamesAsRendered()).toEqual(expectedNames)
      await expect.poll(() => table.projectLinkHrefsAsRendered()).toEqual(expectedUrls)
    })

  })

  baseTest.describe('with error', () => {

    const test = baseTest.extend<{ table: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new ProjectTableViewHelper(mount, [])
        await helper.mount({ error: 'fetch failed' })
        await provide(helper)
      },
    })

    commonProjectTableSuite(test)

    test('error is shown when fetching projects fails', async ({ table }) => {
      await expect(table.errorMessage).toBeVisible()
      await expect(table.errorMessage).toHaveText(/fetch failed/i)
    })

  })

  baseTest.describe('when loading', () => {

    const test = baseTest.extend<{ table: ProjectTableViewHelper }>({
      table: async ({ mount }, provide) => {
        const helper = new ProjectTableViewHelper(mount, [])
        await helper.mount({ isLoading: true })
        await provide(helper)
      },
    })

    commonProjectTableSuite(test)

    test('loading is shown when fetching projects in progress', async ({ table }) => {
      await expect(table.loadingMessage).toBeVisible()
      await expect(table.loadingMessage).toHaveText(/loading/i)
    })

  })
})

function commonProjectTableSuite<T extends TestType<ComponentFixtures & {
  table: ProjectTableViewHelper
}>>(test: T) {
  test('should render a table', async ({ table }) => {
    await expect(table.tagName).resolves.toEqual('TABLE')
    await expect(table.testId).resolves.toEqual(ids.base)
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

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.fixtureNamesInOrder('name', 'asc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: upArrow, lastUpdated: undefined })

    await table.nameColumn.click()

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.fixtureNamesInOrder('name', 'desc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: downArrow, lastUpdated: undefined })

  })

  test('lastUpdated column header should be sortable', async ({ table }) => {

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.fixtureNamesInOrder('name', 'asc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: upArrow, lastUpdated: undefined })

    await table.lastUpdatedColumn.click()

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.fixtureNamesInOrder('lastUpdated', 'asc'))
    await expect.poll(() => table.sortIndicators).toEqual({ name: undefined, lastUpdated: upArrow })

    await table.lastUpdatedColumn.click()

    await expect.poll(() => table.projectNamesAsRendered()).toEqual(table.fixtureNamesInOrder('lastUpdated', 'desc'))
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

