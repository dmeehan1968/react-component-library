import type { ComponentFixtures, MountResult } from '@playwright/experimental-ct-react'
import ProjectTable from './index.tsx'
import type { ProjectRow } from './types.ts'

export class ProjectTableHelper {
  private readonly root: MountResult

  protected constructor(root: MountResult) {
    this.root = root
  }

  static async mount(
    mount: ComponentFixtures['mount'],
    rows?: ProjectRow[],
  ): Promise<ProjectTableHelper> {
    const sample: ProjectRow[] =
      rows ?? [
        { id: '1', name: 'Alpha', href: '/alpha', updatedAt: new Date('2025-01-02T03:04:00'), issueCount: 2 },
        { id: '2', name: 'bravo', href: '/bravo', updatedAt: new Date('2025-01-01T12:30:00'), issueCount: 1 },
        { id: '3', name: 'Delta', href: '/delta', updatedAt: new Date('2024-12-31T23:59:00'), issueCount: 5 },
      ]
    const r = await mount(<ProjectTable rows={sample} defaultSortBy={undefined} defaultSortDir={undefined} />)
    return new ProjectTableHelper(r)
  }

  // header locators
  get header() {
    const self = this
    return {
      selectAll: self.root.getByTestId('select-all'),
      sortByName: self.root.getByTestId('sort-name'),
      sortByUpdatedAt: self.root.getByTestId('sort-updatedAt'),
    }
  }

  rows() {
    const rows = this.root.locator('tbody tr')
    const self = this
    return rows.all().then((handles) =>
      handles.map((row) => ({
        checkbox: row.getByTestId('row-select'),
        nameLink: row.getByTestId('row-name'),
        updatedAt: row.getByTestId('row-updatedAt'),
        issueCount: row.getByTestId('row-issueCount'),
      })),
    )
  }

  // actions
  async toggleHeaderSelectAll() {
    await this.header.selectAll.click()
  }

  async toggleRow(i: number) {
    const rs = await this.rows()
    await rs[i].checkbox.click()
  }

  async clickSortByName() {
    await this.header.sortByName.click()
  }

  async clickSortByUpdatedAt() {
    await this.header.sortByUpdatedAt.click()
  }

  // assertions helpers
  async expectHeaderState(expectFn: typeof import('@playwright/experimental-ct-react').expect, state: 'none' | 'some' | 'all') {
    if (state === 'none') {
      await expectFn(this.header.selectAll).not.toBeChecked()
      await expectFn(this.header.selectAll).toHaveJSProperty('indeterminate', false)
    } else if (state === 'all') {
      await expectFn(this.header.selectAll).toBeChecked()
      await expectFn(this.header.selectAll).toHaveJSProperty('indeterminate', false)
    } else {
      await expectFn(this.header.selectAll).not.toBeChecked()
      await expectFn(this.header.selectAll).toHaveJSProperty('indeterminate', true)
    }
  }

  async expectOrder(
    expectFn: typeof import('@playwright/experimental-ct-react').expect,
    by: 'name' | 'updatedAt',
    dir: 'asc' | 'desc',
  ) {
    const rs = await this.rows()
    const values = await Promise.all(
      rs.map((r) => (by === 'name' ? r.nameLink.textContent() : r.updatedAt.textContent())),
    )
    const sorted = [...values].sort((a, b) => (a! < b! ? -1 : a! > b! ? 1 : 0))
    if (dir === 'desc') sorted.reverse()
    await expectFn(values).toEqual(sorted)
  }

  async expectDateFormat(
    expectFn: typeof import('@playwright/experimental-ct-react').expect,
    i: number,
    pattern: RegExp,
  ) {
    const rs = await this.rows()
    await expectFn(rs[i].updatedAt).toHaveText(pattern)
  }
}
