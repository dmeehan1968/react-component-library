import { type ApiRoute, methodGuard } from '../lib'
import { issuesByProject } from './issues.data.ts'

export const issuesRoute: ApiRoute = {
  path: '/api/projects',
  method: 'GET',
  handler: methodGuard('GET', (req, res) => {
    // Expect URLs like /api/projects/:projectId/issues
    // When mounted at "/api/projects", `req.url` is typically the trimmed remainder,
    // e.g. "/:projectId/issues" (or "/:projectId/issues?…"). Support both full and trimmed forms.
    const url = req.url || ''
    const trimmedMatch = url.match(/^\/([^/]+)\/issues(?:\?.*)?$/)
    const fullMatch = url.match(/^\/api\/projects\/([^/]+)\/issues(?:\?.*)?$/)
    const match = trimmedMatch ?? fullMatch
    if (!match) {
      // Not our sub-route; fallthrough
      return
    }
    const projectId = decodeURIComponent(match[1])
    const data = issuesByProject[projectId] ?? []
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(data))
  }),
}

export default issuesRoute
