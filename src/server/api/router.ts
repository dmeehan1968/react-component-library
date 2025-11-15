import type { IncomingMessage, ServerResponse } from 'node:http'

export interface RouteContext {
  params: Record<string, string>
  query: URLSearchParams
}

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext,
) => void | Promise<void>

export interface CompiledRoute {
  pattern: string
  match(pathname: string): RouteContext['params'] | null
  handlers: Partial<Record<string, RouteHandler>>
}

export interface ApiRouter {
  handle(req: IncomingMessage, res: ServerResponse): void | Promise<void>
}

function normalizeUrl(url: string | undefined): URL {
  const raw = url || '/'
  const hasApiPrefix = raw.startsWith('/api')
  const full = hasApiPrefix ? raw : `/api${raw.startsWith('/') ? '' : '/'}${raw}`
  return new URL(full, 'http://localhost')
}

export function compilePattern(pattern: string): (pathname: string) => Record<string, string> | null {
  const parts = pattern.replace(/^\/+|\/+$/g, '').split('/')
  const paramNames: string[] = []
  const regexParts = parts.map((segment) => {
    if (segment.startsWith(':')) {
      paramNames.push(segment.slice(1))
      return '([^/]+)'
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  const regex = new RegExp(`^/${regexParts.join('/')}/?$`)

  return (pathname: string) => {
    const match = regex.exec(pathname)
    if (!match) return null
    const params: Record<string, string> = {}
    for (let i = 0; i < paramNames.length; i += 1) {
      const value = match[i + 1]
      params[paramNames[i]] = value ? decodeURIComponent(value) : ''
    }
    return params
  }
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const

export function createApiRouter(routes: CompiledRoute[]): ApiRouter {
  return {
    handle(req, res) {
      const url = normalizeUrl(req.url)
      const pathname = url.pathname
      const method = (req.method || 'GET').toUpperCase()

      const route = routes.find((r) => r.match(pathname))
      if (!route) {
        if (!res.writableEnded) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end('Not Found')
        }
        return
      }

      const params = route.match(pathname) || {}
      const ctx: RouteContext = {
        params,
        query: url.searchParams,
      }

      const availableMethods = HTTP_METHODS.filter((m) => route.handlers[m])

      let handler: RouteHandler | undefined

      if (method === 'HEAD') {
        const headHandler = route.handlers.HEAD
        const getHandler = route.handlers.GET
        if (headHandler) {
          handler = headHandler
        } else if (getHandler) {
          const originalEnd = res.end.bind(res)
          const response = res as ServerResponse & { _originalEnd?: ServerResponse['end'] }
          response._originalEnd = originalEnd
          response.end = ((
            _chunk?: unknown,
            encoding?: BufferEncoding | undefined,
            cb?: (() => void) | undefined,
          ) => {
            if (typeof encoding === 'string') {
              return originalEnd(undefined, encoding, cb)
            }
            return originalEnd(undefined, cb)
          }) as ServerResponse['end']
          handler = getHandler
        }
      } else if (method === 'OPTIONS') {
        const optionsHandler = route.handlers.OPTIONS
        if (optionsHandler) {
          handler = optionsHandler
        } else if (availableMethods.length > 0) {
          res.statusCode = 204
          res.setHeader('Allow', availableMethods.join(', '))
          res.end()
          return
        }
      } else {
        handler = route.handlers[method]
      }

      if (!handler) {
        res.statusCode = 405
        if (availableMethods.length > 0) {
          res.setHeader('Allow', availableMethods.join(', '))
        }
        res.end('Method Not Allowed')
        return
      }

      return handler(req, res, ctx)
    },
  }
}
