import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { JsonCodec, type Project, ProjectSchema } from "../../../schemas/project.ts"

import type { RouteHandler } from '../router'

class JunieLogs {

	getLogPath(): string {
		switch (os.platform()) {
			case 'win32':
				return path.join(process.env.APPDATA || '', '..', 'Local', 'JetBrains')
			case 'darwin': {
				const root = process.env.HOME || path.join('/Users', os.userInfo().username)
				return path.resolve(root, 'Library', 'Caches', 'JetBrains')
			}
			default:
				return path.join(os.homedir(), '.cache', 'JetBrains')
		}
	}

	slugify(name: string): string {
		return name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	private _projects: Promise<Project[]> | undefined = undefined

	async getProjects(): Promise<Project[]> {

		const getProjects = async () => {

			const logRoot = this.getLogPath()
			let ideDirs
			try {
				ideDirs = await fs.readdir(logRoot, { withFileTypes: true })
			} catch {
				return []
			}

			const projectsByName = new Map<string, Set<string>>()

			for (const ideEntry of ideDirs) {
				if (!ideEntry.isDirectory()) continue
				const ideName = ideEntry.name
				const projectsDir = path.join(logRoot, ideName, 'projects')

				let projectEntries
				try {
					projectEntries = await fs.readdir(projectsDir, { withFileTypes: true })
				} catch {
					continue
				}

				for (const projectEntry of projectEntries) {
					if (!projectEntry.isDirectory()) continue
					const projectName = projectEntry.name
					let ideSet = projectsByName.get(projectName)
					if (!ideSet) {
						ideSet = new Set<string>()
						projectsByName.set(projectName, ideSet)
					}
					ideSet.add(ideName)
				}
			}

			const now = new Date()
			const projects: Project[] = []

			for (const [projectName, ideSet] of projectsByName) {
				const slug = this.slugify(projectName)
				projects.push({
					name: projectName,
					url: `/projects/${slug}/issues`,
					issueCount: 0,
					lastUpdated: now,
					ideNames: Array.from(ideSet).sort(),
				})
			}

			return projects

		}

		this._projects ??= getProjects()

		return this._projects

	}

}

const junie = new JunieLogs()

export const GET: RouteHandler = async (_req, res) => {
	const projects = await junie.getProjects()

	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json; charset=utf-8')
	res.end(JsonCodec(ProjectSchema.array()).encode(projects))
}
