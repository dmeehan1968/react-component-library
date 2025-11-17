import { z } from 'zod'

export const ProjectSchema = z.object({
	name: z.string(),
	url: z.string(),
	lastUpdated: z.coerce.date().optional(),
	issueCount: z.number().optional(),
	ideNames: z.string().array().optional(),
})

export type Project = z.infer<typeof ProjectSchema>

export const JsonCodec = <T extends z.ZodTypeAny>(schema: T) => z.codec(z.string(), schema, {
	decode: (input, ctx) => {
		try {
			return JSON.parse(input)
		} catch (error) {
			ctx.issues.push({
				code: "invalid_format",
				format: "json",
				input,
				message: error instanceof Error ? error.message : String(error),
			})
			return z.NEVER
		}
	},
	encode: (value) => JSON.stringify(value),
})