import { defineConfig } from '@playwright/experimental-ct-react'

export default defineConfig({
  testDir: './src',
  testMatch: /.*\.test\.(ts|tsx)$/,
  fullyParallel: true,
  use: {
    ctTemplateDir: 'playwright',
  },
})
