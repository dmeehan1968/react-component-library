import type { Plugin } from 'vite'
import type { ApiRoute } from './lib'
import { projectsRoute } from './projects'
import { issuesRoute } from './issues'

export function apiPlugin(routes: ApiRoute[] = [projectsRoute, issuesRoute]): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      for (const route of routes) {
        server.middlewares.use(route.path, (req, res, next) => {
          route.handler(req, res)
          if (!res.writableEnded) next?.()
        })
      }
    },
    configurePreviewServer(server) {
      for (const route of routes) {
        server.middlewares.use(route.path, (req, res, next) => {
          route.handler(req, res)
          if (!res.writableEnded) next?.()
        })
      }
    },
  }
}

export default apiPlugin
