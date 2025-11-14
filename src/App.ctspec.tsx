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
  test('mounts without throwing', async ({ app }) => {
    // If we reach this point, mounting <App /> inside the CT harness succeeded.
    await expect(app.root).not.toBeNull()
  })
})
