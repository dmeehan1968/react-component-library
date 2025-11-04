import ctReact from '@playwright/experimental-ct-react'
import { ProjectTableHelper } from './index.ctspec.helper.tsx'

const test = ctReact.test.extend<{ fixture: ProjectTableHelper }>({
  fixture: async ({ mount }, provide) => {
    const fixture = await ProjectTableHelper.mount(mount)
    await provide(fixture)
  },
})

const expect = ctReact.expect

function ymd(date: string) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${dd} ${hh}:${mm}`
}

test.describe('ProjectTable (Playwright CT)', () => {
  test('Selection: header tri-state and toggle logic', async ({ fixture }) => {
    await fixture.expectHeaderState(expect, 'none')
    await fixture.toggleHeaderSelectAll()
    await fixture.expectHeaderState(expect, 'all')

    await fixture.toggleRow(1)
    await fixture.expectHeaderState(expect, 'some')

    await fixture.toggleHeaderSelectAll()
    await fixture.expectHeaderState(expect, 'none')
  })

  test('Sorting: Name asc/desc; only one active at a time', async ({ fixture }) => {
    // Name asc
    await fixture.clickSortByName()
    await fixture.expectOrder(expect, 'name', 'asc')

    // Name desc
    await fixture.clickSortByName()
    await fixture.expectOrder(expect, 'name', 'desc')

    // Switch to updatedAt asc resets Name
    await fixture.clickSortByUpdatedAt()
    await fixture.expectOrder(expect, 'updatedAt', 'asc')

    // Toggle updatedAt desc
    await fixture.clickSortByUpdatedAt()
    await fixture.expectOrder(expect, 'updatedAt', 'desc')
  })

  test('Link semantics: each name cell renders an <a href="...">', async ({ fixture }) => {
    const rows = await fixture.rows()
    await expect(rows[0].nameLink).toHaveAttribute('href', '/alpha')
    await expect(rows[1].nameLink).toHaveAttribute('href', '/bravo')
    await expect(rows[2].nameLink).toHaveAttribute('href', '/delta')
  })

  test('Date formatting: YYYY/MM/DD HH:MM (24-hour, zero-padded)', async ({ fixture }) => {
    const rows = await fixture.rows()
    const expected = [
      ymd('2025-01-02T03:04:00'),
      ymd('2025-01-01T12:30:00'),
      ymd('2024-12-31T23:59:00'),
    ]
    for (let i = 0; i < rows.length; i++) {
      await expect(rows[i].updatedAt).toHaveText(expected[i])
      await fixture.expectDateFormat(expect, i, /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)
    }
  })
})
