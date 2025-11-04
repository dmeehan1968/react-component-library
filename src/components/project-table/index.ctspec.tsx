import ctReact from '@playwright/experimental-ct-react'
import { expect } from '@playwright/experimental-ct-react'
import { ProjectTableHelper } from './index.ctspec.helper'

const test = ctReact.test.extend({
  fixture: async ({ mount }, provide) => {
    const helper = await ProjectTableHelper.mount(mount)
    await provide(helper)
  },
})

test.describe('<ProjectTable>', () => {
  test('selection: header tri-state and toggle behavior', async ({ fixture }) => {
    // Initially none selected
    await expect(fixture.header.selectAll).toBeVisible()
    // aria-checked is either false or undefined for none; ensure not checked
    await expect(fixture.header.selectAll).not.toBeChecked()

    // Toggle header -> all selected
    await fixture.toggleHeaderSelectAll()
    const rowsAll = fixture.rows()
    const totalAfterAll = await rowsAll.locator.count()
    await expect(rowsAll.locator.locator('input:checked')).toHaveCount(totalAfterAll)

    // Toggle a single row -> header becomes 'some'
    await fixture.toggleRow(0)
    await expect(fixture.header.selectAll).not.toBeChecked()
    // Indeterminate via property cannot be directly asserted; check that not all are checked
    const total = await rowsAll.locator.count()
    const checked = await rowsAll.locator.locator('input:checked').count()
    expect(checked).toBeLessThan(total)

    // Toggle header when 'some' -> none selected
    await fixture.toggleHeaderSelectAll()
    await expect(rowsAll.locator.locator('input:checked')).toHaveCount(0)
  })

  test('sorting: Name and Last Updated single-active sort toggling', async ({ fixture }) => {
    const rows = fixture.rows()

    // Name ASC should be default: Alpha, Bravo, Echo
    await expect(rows.at(0).nameLink).toHaveText('Alpha')
    await expect(rows.at(1).nameLink).toHaveText('Bravo')
    await expect(rows.at(2).nameLink).toHaveText('Echo')

    // Toggle Name to DESC
    await fixture.clickSortByName()
    await expect(rows.at(0).nameLink).toHaveText('Echo')
    await expect(rows.at(2).nameLink).toHaveText('Alpha')

    // Activate UpdatedAt (becomes ASC by default)
    await fixture.clickSortByUpdatedAt()
    // Dates in sample: 2024-12-20, 2025-01-05, 2025-08-10 -> ASC means Echo, Alpha, Bravo
    await expect(rows.at(0).nameLink).toHaveText('Echo')
    await expect(rows.at(1).nameLink).toHaveText('Alpha')
    await expect(rows.at(2).nameLink).toHaveText('Bravo')

    // Toggle UpdatedAt to DESC
    await fixture.clickSortByUpdatedAt()
    await expect(rows.at(0).nameLink).toHaveText('Bravo')
    await expect(rows.at(2).nameLink).toHaveText('Echo')
  })

  test('link semantics: name cell renders an anchor with href', async ({ fixture }) => {
    const first = fixture.rows().at(0)
    await expect(first.nameLink).toHaveAttribute('href', /\/projects\//)
  })

  test('date formatting: YYYY/MM/DD HH:MM 24-hour, zero-padded', async ({ fixture }) => {
    const rows = fixture.rows()
    const pattern = /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/
    await expect(rows.at(0).updatedAt).toHaveText(pattern)
    await expect(rows.at(1).updatedAt).toHaveText(pattern)
    await expect(rows.at(2).updatedAt).toHaveText(pattern)
  })
})
