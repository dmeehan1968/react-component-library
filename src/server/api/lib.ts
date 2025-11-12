import type { IncomingMessage, ServerResponse } from 'node:http'

// Minimal route types to make it easy to add more routes later
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'

export interface ApiRoute {
  path: `/${string}`
  method: HttpMethod
  handler: (req: IncomingMessage, res: ServerResponse) => void
}

export function methodGuard(method: HttpMethod, handler: ApiRoute['handler']): ApiRoute['handler'] {
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
