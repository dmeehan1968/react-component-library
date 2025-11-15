import type { RouteHandler } from '../../../router'
import { issuesByProject } from './issues.data.ts'

export const GET: RouteHandler = (_req, res, ctx) => {
	const { projectId } = ctx.params
	const data = issuesByProject[projectId] ?? []
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json; charset=utf-8')
	res.end(JSON.stringify(data))
}
