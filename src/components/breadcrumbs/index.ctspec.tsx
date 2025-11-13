import { test, expect } from '@playwright/experimental-ct-react'
import { BreadcrumbsHelper } from './index.ctspec.helper.tsx'

test.describe('Breadcrumbs (CT)', () => {
  test('renders single non-link crumb on root', async ({ mount }) => {
    const h = await BreadcrumbsHelper.mountAtPath(mount, '/')

    await expect(h.text('Projects')).toBeVisible()
    await expect(h.linkByName('Projects')).toHaveCount(0)
  })

  test('issues route: Projects link + Project Name (no Issues crumb)', async ({ mount }) => {
    const h = await BreadcrumbsHelper.mountAtPath(mount, '/projects/react-component-library/issues')

    await expect(h.linkByName('Projects')).toBeVisible()
    await expect(h.text('React Component Library')).toBeVisible()
    await expect(h.linkByName('React Component Library')).toHaveCount(0)

    await expect(h.nav.getByText('Issues')).toHaveCount(0)

    const count = await h.itemCount
    expect(count).toBe(2)
  })
})
