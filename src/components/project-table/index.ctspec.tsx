import ctReact from '@playwright/experimental-ct-react'
import { ProjectTableHelper } from './index.ctspec.helper.tsx'

const test = ctReact.test.extend<{ table: ProjectTableHelper }>({
  table: async ({ mount }, provide) => {
    const helper = await ProjectTableHelper.mount(mount)
    await provide(helper)
  },
})

const expect = ctReact.expect

const DATE_RE = /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/

test.describe('ProjectTable (CT)', () => {
  test('Selection flow: none -> all -> some -> none', async ({ table }) => {
    await table.expectHeaderState('none')
    await table.toggleHeaderSelectAll()
    await table.expectHeaderState('all')
    await table.toggleRow(1) // unselect one
    await table.expectHeaderState('some')
    await table.toggleHeaderSelectAll() // when some -> none
    await table.expectHeaderState('none')
  })

  test('Sorting: name asc/desc and updatedAt asc/desc; single active', async ({ table }) => {
    // Default is name asc (from helper)
    await table.expectOrder('name', 'asc')
    await table.clickSortByName()
    await table.expectOrder('name', 'desc')

    // Switch to updatedAt asc
    await table.clickSortByUpdatedAt()
    await table.expectOrder('updatedAt', 'asc')
    // Toggle to desc
    await table.clickSortByUpdatedAt()
    await table.expectOrder('updatedAt', 'desc')
  })

  test('Link semantics: name renders as <a href=...>', async ({ table }) => {
    const rows = await table.rows()
    await expect(rows[0].nameLink).toHaveAttribute('href', /\/alpha|\/beta|\/gamma/)
  })

  test('Date formatting: YYYY/MM/DD HH:MM (24h, zero-padded)', async ({ table }) => {
    await table.expectDateFormat(0, DATE_RE)
    await table.expectDateFormat(1, DATE_RE)
    await table.expectDateFormat(2, DATE_RE)
  })
})
