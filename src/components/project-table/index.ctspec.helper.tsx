import type { ComponentFixtures, MountResult } from '@playwright/experimental-ct-react'
import ProjectTable, { type ProjectTableProps } from './index.tsx'
import type { ProjectRow } from './types.ts'

export class ProjectTableHelper {
  private readonly root: MountResult

  protected constructor(root: MountResult) {
    this.root = root
  }

  static async mount(mount: ComponentFixtures['mount'], rows?: ProjectRow[]): Promise<ProjectTableHelper> {
    const sample: ProjectRow[] = rows ?? [
      { id: 'a', name: 'Alpha', href: '/alpha', updatedAt: new Date('2025-01-02T03:04:00'), issueCount: 3 },
      { id: 'b', name: 'Beta', href: '/beta', updatedAt: new Date('2024-12-31T23:59:00'), issueCount: 1 },
      { id: 'c', name: 'Gamma', href: '/gamma', updatedAt: new Date('2025-06-15T12:30:00'), issueCount: 0 },
    ]
    const props: ProjectTableProps = { rows: sample, defaultSortBy: 'name', defaultSortDir: 'asc' }
    return new ProjectTableHelper(await mount(<ProjectTable {...props} />))
  }

  header = {
    get selectAll() { return this.root.getByTestId('select-all') },
    get sortByName() { return this.root.getByTestId('sort-name') },
    get sortByUpdatedAt() { return this.root.getByTestId('sort-updatedAt') },
  }

  rows() {
    const body = this.root.locator('tbody tr')
    return body.all().then(() => body).then(async (loc) => {
      const count = await loc.count()
      const items = [] as const
      const arr: { checkbox: ReturnType<MountResult['locator']>; nameLink: ReturnType<MountResult['locator']>; updatedAt: ReturnType<MountResult['locator']>; issueCount: ReturnType<MountResult['locator']> }[] = []
      for (let i = 0; i < count; i++) {
        const row = loc.nth(i)
        arr.push({
          checkbox: row.getByRole('checkbox'),
          nameLink: row.getByTestId('name-link'),
          updatedAt: row.locator('td').nth(2),
          issueCount: row.locator('td').nth(3),
        })
      }
      return arr
    })
  }

  async toggleHeaderSelectAll() {
    await this.header.selectAll.click()
  }

  async toggleRow(i: number) {
    const rs = await this.rows()
    await rs[i].checkbox.click()
  }

  async clickSortByName() { await this.header.sortByName.click() }
  async clickSortByUpdatedAt() { await this.header.sortByUpdatedAt.click() }

  async expectHeaderState(state: 'none' | 'some' | 'all') {
    const cb = this.header.selectAll
    if (state === 'some') {
      await cb.toHaveJSProperty('indeterminate', true)
    } else if (state === 'all') {
      const v = await cb.isChecked()
      if (!v) throw new Error('expected all (checked)')
    } else {
      await cb.isChecked().then((v) => { if (v) throw new Error('expected none') })
    }
  }

  async expectOrder(by: 'name' | 'updatedAt', dir: 'asc' | 'desc') {
    const rs = await this.rows()
    const texts = await Promise.all(rs.map((r) => (by === 'name' ? r.nameLink.textContent() : r.updatedAt.textContent())))
    const sorted = [...texts].sort((a, b) => (a! < b! ? -1 : a! > b! ? 1 : 0))
    if (dir === 'desc') sorted.reverse()
    if (JSON.stringify(texts) !== JSON.stringify(sorted)) throw new Error(`order mismatch: got ${texts} expected ${sorted}`)
  }

  async expectDateFormat(i: number, pattern: RegExp) {
    const rs = await this.rows()
    const text = await rs[i].updatedAt.textContent()
    if (!pattern.test(text ?? '')) throw new Error(`date not in format: ${text}`)
  }
}
