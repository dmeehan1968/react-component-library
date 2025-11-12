import ctReact from '@playwright/experimental-ct-react'
import { toBeHorizontallyCentered } from "../playwright/matchers/toBeHorizontallyCentered.tsx"
import { toBeVerticallyCentered } from "../playwright/matchers/ToBeVerticallyCentered.tsx"
import { AppHelper } from './App.ctspec.helper.tsx'

export const test = ctReact.test.extend<{ app: AppHelper }>({
  app: async ({ mount }, provide) => {
    const app = await AppHelper.mount(mount)
    await provide(app)
  },
})

export const expect = ctReact.expect.extend({
  toBeHorizontallyCentered,
  toBeVerticallyCentered,
})

test.describe('App', () => {
  test('renders the project table', async ({ app }) => {
    await expect(app.projectsTable).toBeVisible()
  })

  test('Vite logo links to the Vite website', async ({ app }) => {
    await expect(app.viteLink).toHaveAttribute('href', /https:\/\/vite\.dev\/?/)
  })

  test('React logo links to the React website', async ({ app }) => {
    await expect(app.reactLink).toHaveAttribute('href', /https:\/\/react\.dev\/?/)
  })

  test('content is centered horizontally and vertically', async ({ app }) => {
    await expect(app.root).toBeHorizontallyCentered()
    await expect(app.root).toBeVerticallyCentered()
  })
})
