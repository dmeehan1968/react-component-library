import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import type { IncomingMessage, ServerResponse } from 'node:http'
import { projectsData } from './src/server/projects.data'

// https://vite.dev/config/
function projectsApiPlugin(): Plugin {
  const handle = (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) return
    if (req.method !== 'GET') {
      res.statusCode = 405
      res.setHeader('Allow', 'GET')
      res.end('Method Not Allowed')
      return
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(projectsData))
  }

  return {
    name: 'projects-api',
    configureServer(server) {
      server.middlewares.use('/api/projects', handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/projects', handle)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), projectsApiPlugin()],
})
