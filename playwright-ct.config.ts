import { defineConfig } from '@playwright/experimental-ct-react'

export default defineConfig({
  testDir: './src',
  testMatch: /.*\.ct\.spec\.(ts|tsx)$/,
  fullyParallel: true,
  // Use the default CT HTML template directory ('playwright').
  ctTemplateDir: 'playwright',
  // Register custom matchers and any globals
  ctSetup: './playwright/ct.setup.ts',
})
