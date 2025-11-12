import { projectsData } from './projects.data.ts'
import { methodGuard, type ApiRoute } from '../lib'

export const projectsRoute: ApiRoute = {
  path: '/api/projects',
  method: 'GET',
  handler: methodGuard('GET', (_req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(projectsData))
  }),
}

export default projectsRoute
