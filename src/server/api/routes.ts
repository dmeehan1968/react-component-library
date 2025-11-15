import type { CompiledRoute, RouteHandler } from './router'
import { compilePattern } from './router'

const modules = import.meta.glob('./**/index.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>

function filePathToPattern(filePath: string): string {
  let path = filePath
  if (path.startsWith('./')) {
    path = path.slice(2)
  }
  if (path.endsWith('/index.ts')) {
    path = path.slice(0, -'/index.ts'.length)
  }
  const segments = path.split('/').filter(Boolean)
  const mapped = segments.map((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const name = segment.slice(1, -1)
      return `:${name}`
    }
    return segment
  })
  return `/api/${mapped.join('/')}`
}

export const compiledRoutes: CompiledRoute[] = Object.entries(modules)
  .map<CompiledRoute | null>(([path, mod]) => {
    const handlers: Partial<Record<string, RouteHandler>> = {}
    for (const [key, value] of Object.entries(mod)) {
      if (typeof value === 'function') {
        const upper = key.toUpperCase()
        if (upper === 'GET' || upper === 'POST' || upper === 'PUT' || upper === 'PATCH' || upper === 'DELETE' || upper === 'OPTIONS' || upper === 'HEAD') {
          handlers[upper] = value as RouteHandler
        }
      }
    }

    const methodKeys = Object.keys(handlers)
    if (methodKeys.length === 0) return null

    const pattern = filePathToPattern(path)

    return {
      pattern,
      match: compilePattern(pattern),
      handlers,
    }
  })
  .filter((route): route is CompiledRoute => route !== null)
