import { projectsData } from './projects.data.ts'
import { issuesByProject } from './[projectId]/issues/issues.data.ts'
import type { RouteHandler } from '../router'

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

export const GET: RouteHandler = (_req, res) => {
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
}
