import { z } from 'zod'

export const ProjectSchema = z.object({
  name: z.string(),
  url: z.string(),
  lastUpdated: z.coerce.date().optional(),
  issueCount: z.number().optional(),
  ideNames: z.string().array().optional(),
})
export type ProjectSchema = z.infer<typeof ProjectSchema>

export class Project implements ProjectSchema {
  name: string
  url: string
  lastUpdated?: Date | undefined
  issueCount?: number | undefined
  ideNames?: string[] | undefined

  constructor(props: ProjectSchema) {
    const decoded = ProjectSchema.decode(props)
    this.name = decoded.name
    this.url = decoded.url
    this.lastUpdated = decoded.lastUpdated
    this.issueCount = decoded.issueCount
    this.ideNames = decoded.ideNames
  }

  static get schema() {
    return ProjectSchema
  }
}

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
  encode: (value) => {
    return JSON.stringify(value)
  },
})