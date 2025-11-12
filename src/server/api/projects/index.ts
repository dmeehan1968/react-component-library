import { projectsData } from './projects.data.ts'
import { methodGuard, type ApiRoute } from '../lib'

export const projectsRoute: ApiRoute = {
  path: '/api/projects',
  method: 'GET',
  handler: methodGuard('GET', (_req, res) => {
    // Only respond to the collection endpoint (no trailing path segments)
    // When mounted at "/api/projects" via `server.middlewares.use(path, handler)`,
    // Connect/Polka-style middleware trims the matched prefix from `req.url`.
    // That means inside this handler `req.url` will often be "/" (or "" or "/?query")
    // rather than the full "/api/projects" path. Support both forms.
    const url = _req.url || ''
    const isTrimmedCollection = url === '' || url === '/' || /^\/\?/.test(url)
    const isFullCollection = /^\/api\/projects(?:\?.*)?$/.test(url)
    const isCollection = isTrimmedCollection || isFullCollection
    if (!isCollection) return
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(projectsData))
  }),
}

export default projectsRoute
