import React from 'react'
import type { MountResult } from '@playwright/experimental-ct-react'
import type { ProjectRow } from './types'
import ProjectTable from './index'

export class ProjectTableHelper {
  constructor(private mountResult: MountResult) {}

  static sampleRows(): ProjectRow[] {
    return [
      { id: '1', name: 'Alpha', href: '/projects/1', updatedAt: new Date('2025-01-05T09:04:00'), issueCount: 2 },
      { id: '2', name: 'Bravo', href: '/projects/2', updatedAt: new Date('2025-08-10T14:30:00'), issueCount: 5 },
      { id: '3', name: 'Echo', href: '/projects/3', updatedAt: new Date('2024-12-20T23:59:00'), issueCount: 0 },
    ]
  }

  static async mount(mount: (component: React.ReactElement) => Promise<MountResult>, rows?: ProjectRow[]) {
    const res = await mount(
      <ProjectTable rows={rows ?? ProjectTableHelper.sampleRows()} defaultSortBy="name" defaultSortDir="asc" />
    )
    return new ProjectTableHelper(res)
  }

  get root() {
    return this.mountResult.locator('table')
  }

  get header() {
    return {
      selectAll: this.mountResult.getByTestId('select-all'),
      sortByName: this.mountResult.getByRole('button', { name: /^Name/ }),
      sortByUpdatedAt: this.mountResult.getByRole('button', { name: /^Last Updated/ }),
    }
  }

  rows() {
    const rows = this.mountResult.locator('tbody tr')
    const rowAt = (i: number) => {
      const scope = rows.nth(i)
      return {
        checkbox: scope.getByRole('checkbox'),
        nameLink: scope.getByRole('link'),
        updatedAt: scope.locator('td').nth(2),
        issueCount: scope.locator('td').nth(3),
      }
    }
    return { locator: rows, at: rowAt }
  }

  async toggleHeaderSelectAll() {
    await this.header.selectAll.click()
  }

  async toggleRow(i: number) {
    await this.rows().at(i).checkbox.click()
  }

  async clickSortByName() {
    await this.header.sortByName.click()
  }

  async clickSortByUpdatedAt() {
    await this.header.sortByUpdatedAt.click()
  }
}
