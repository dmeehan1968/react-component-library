import type { Plugin } from 'vite'
import { createApiRouter } from './router'
import { compiledRoutes } from './routes'

export function apiPlugin(): Plugin {
  const router = createApiRouter(compiledRoutes)

  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        await router.handle(req, res)
        if (!res.writableEnded) next?.()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        await router.handle(req, res)
        if (!res.writableEnded) next?.()
      })
    },
  }
}

export default apiPlugin
