import { projectsData } from './projects.data.ts'
import { issuesByProject } from '../issues/issues.data.ts'
import { methodGuard, type ApiRoute } from '../lib'

/**
 * Derive per‑project stats from the issues dataset.
 * - issueCount: number of issues for the project
 * - lastUpdated: ISO string of the most recent issue timestamp (empty string if none)
 */
export function deriveProjectStats(
  issues: typeof issuesByProject,
): Record<string, { issueCount: number; lastUpdated: string }> {
  const result: Record<string, { issueCount: number; lastUpdated: string }> = {}
  for (const [slug, list] of Object.entries(issues)) {
    const issueCount = list.length
    const lastUpdated = list.length
      ? new Date(
          Math.max(
            ...list.map((i) => new Date(i.timestamp).getTime()),
          ),
        ).toISOString()
      : ''
    result[slug] = { issueCount, lastUpdated }
  }
  return result
}

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
    // Merge derived stats (issueCount, lastUpdated) into the static project list.
    const stats = deriveProjectStats(issuesByProject)
    const enriched = projectsData.map((p) => {
      // Extract slug from "/projects/<slug>/issues"
      const match = p.url.match(/^\/projects\/([^/]+)\/issues$/)
      const slug = match ? match[1] : ''
      const s = slug && stats[slug]
      return s
        ? {
            ...p,
            issueCount: s.issueCount,
            lastUpdated: s.lastUpdated,
          }
        : { ...p, issueCount: 0, lastUpdated: '' }
    })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(enriched))
  }),
}

export default projectsRoute
