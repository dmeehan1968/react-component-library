import { test as baseTest, expect as baseExpect } from '@playwright/experimental-ct-react'
import { AppHelper } from './App.ctspec.helper.tsx'

export const test = baseTest.extend<{ app: AppHelper }>({
  app: async ({ mount }, provide) => {
    const app = await AppHelper.mount(mount)
    await provide(app)
  },
})

export const expect = baseExpect

test.describe('App (Playwright CT)', () => {
  test('renders exactly one Counter component', async ({ app }) => {
    await expect(app.counter).toHaveCount(1)
  })

  test('Vite logo links to the Vite website', async ({ app }) => {
    await expect(app.viteLink).toHaveAttribute('href', /https:\/\/vite\.dev\/?/)
  })

  test('React logo links to the React website', async ({ app }) => {
    await expect(app.reactLink).toHaveAttribute('href', /https:\/\/react\.dev\/?/)
  })

  test('content is centered horizontally and vertically', async ({ app }) => {
    // Assert centering semantics by walking ancestors from a known child
    // to find an element using the centering utilities.
    expect(await app.isContentCentered()).toBe(true)
  })
})
