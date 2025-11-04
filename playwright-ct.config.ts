import { defineConfig } from '@playwright/experimental-ct-react'
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  testDir: './src',
  testMatch: /.*\.ctspec\.(ts|tsx)$/,
  fullyParallel: true,
  use: {
    ctTemplateDir: 'playwright',
    ctViteConfig: {
      plugins: [tailwindcss() as never, react() as never],
    },
  },
})
