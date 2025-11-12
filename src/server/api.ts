import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { projectsData } from './projects.data'

// Minimal route types to make it easy to add more routes later
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'

export interface ApiRoute {
  path: `/${string}`
  method: HttpMethod
  handler: (req: IncomingMessage, res: ServerResponse) => void
}

function methodGuard(method: HttpMethod, handler: ApiRoute['handler']): ApiRoute['handler'] {
  return (req, res) => {
    if (!req.url) return
    if (req.method !== method) {
      res.statusCode = 405
      res.setHeader('Allow', method)
      res.end('Method Not Allowed')
      return
    }
    handler(req, res)
  }
}

// Existing /api/projects route, exposed in a structured way
export const projectsRoute: ApiRoute = {
  path: '/api/projects',
  method: 'GET',
  handler: methodGuard('GET', (_req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(projectsData))
  }),
}

// Create a Vite plugin from a list of routes
export function apiPlugin(routes: ApiRoute[] = [projectsRoute]): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      for (const route of routes) {
        server.middlewares.use(route.path, (req, res, next) => {
          // Only handle exact mount path; let others pass through
          // Connect mounts strip the prefix, but we still rely on method guard
          route.handler(req, res)
          // If response wasn't ended by handler, continue the chain
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
