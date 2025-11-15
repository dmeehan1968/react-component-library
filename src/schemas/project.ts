import { z } from 'zod'

// Accept API payloads that may represent numbers/dates as strings, but output strict types.
export const ProjectSchema = z.object({
	name: z.string(),
	url: z.string(),
	// API returns ISO string; coerce to Date and validate
	lastUpdated: z.union([z.string(), z.date(), z.number()])
		.transform((v) => (v instanceof Date ? v : new Date(v)))
		.refine((d) => !Number.isNaN(d.getTime()), {
			message: 'Invalid date',
		}),
	// Allow numeric strings, but output as number
	issueCount: z.union([z.number(), z.string()]).transform((v) =>
		typeof v === 'string' ? Number(v) : v,
	),
	// New field listing IDE names that contain this project; defaults to [] when absent
	ideNames: z.array(z.string()).default([]),
}).strict()

export type ProjectModel = z.infer<typeof ProjectSchema>

export const ProjectArraySchema = z.array(ProjectSchema)

export function parseProjects(input: unknown): ProjectModel[] {
  const res = ProjectArraySchema.safeParse(input)
  if (!res.success) {
    // In providers, we’ll surface errors separately; here we throw for simplicity
    throw new Error(res.error.message)
  }
  return res.data
}
