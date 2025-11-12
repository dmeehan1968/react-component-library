import ctReact from '@playwright/experimental-ct-react'
import { AppHelper } from './App.ctspec.helper.tsx'

export const test = ctReact.test.extend<{ app: AppHelper }>({
  app: async ({ mount }, provide) => {
    const app = await AppHelper.mount(mount)
    await provide(app)
  },
})

const expect = ctReact.expect

test.describe('App', () => {
  test('renders the project table', async ({ app }) => {
    await expect(app.projectsTable).toBeVisible()
  })

  test('projects table spans full width (has w-full class)', async ({ app }) => {
    await expect(app.projectsTable).toHaveClass(/w-full/)
  })
})
