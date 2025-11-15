import os from 'node:os'
import path from 'node:path'
import { promises as fs } from 'node:fs'

import type { ProjectDTO } from './projects.data.ts'
import type { RouteHandler } from '../router'

function getUsername(): string {
	return os.userInfo().username
}

function getLogPath(): string {
	switch (os.platform()) {
		case 'win32':
			return path.join(process.env.APPDATA || '', '..', 'Local', 'JetBrains')
		case 'darwin': {
			const root = process.env.HOME || path.join('/Users', getUsername())
			return path.resolve(root, 'Library', 'Caches', 'JetBrains')
		}
		default:
			return path.join(os.homedir(), '.cache', 'JetBrains')
	}
}

function slugify(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

async function discoverProjectsFromFs(): Promise<ProjectDTO[]> {
	const logRoot = getLogPath()
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

	const nowIso = new Date().toISOString()
	const projects: ProjectDTO[] = []

	for (const [projectName, ideSet] of projectsByName) {
		const slug = slugify(projectName)
		projects.push({
			name: projectName,
			url: `/projects/${slug}/issues`,
			issueCount: 0,
			lastUpdated: nowIso,
			ideNames: Array.from(ideSet).sort(),
		})
	}

	return projects
}

export const GET: RouteHandler = async (_req, res) => {
	const projects = await discoverProjectsFromFs()
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json; charset=utf-8')
	res.end(JSON.stringify(projects))
}
