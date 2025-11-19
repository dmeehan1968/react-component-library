import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiPluginEntrypoint(): Plugin {
  return {
    name: 'api-routes-entry',
    async configureServer(server) {
      const mod = await server.ssrLoadModule('/src/server/api/index.ts')
      const innerFactory = mod.apiPlugin
      const inner = innerFactory()
      await inner.configureServer(server)
    },
    async configurePreviewServer(server) {
      const mod = await server.ssrLoadModule('/src/server/api/index.ts')
      const innerFactory = mod.apiPlugin
      const inner = innerFactory()
      await inner.configurePreviewServer?.(server)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), apiPluginEntrypoint()],
})
