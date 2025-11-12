import { z } from 'zod'

export const IssueStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
])

export const IssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  project: z.string(),
  description: z.string(),
  timestamp: z.union([z.string(), z.date(), z.number()])
    .transform((v) => (v instanceof Date ? v : new Date(v)))
    .refine((d) => d instanceof Date && !Number.isNaN(d.getTime()), {
      message: 'Invalid date',
    }),
  inputTokens: z.union([z.number(), z.string()]).transform((v) => typeof v === 'string' ? Number(v) : v),
  outputTokens: z.union([z.number(), z.string()]).transform((v) => typeof v === 'string' ? Number(v) : v),
  cacheTokens: z.union([z.number(), z.string()]).transform((v) => typeof v === 'string' ? Number(v) : v),
  cost: z.union([z.number(), z.string()]).transform((v) => typeof v === 'string' ? Number(v) : v),
  time: z.union([z.number(), z.string()]).transform((v) => typeof v === 'string' ? Number(v) : v),
  status: IssueStatusSchema,
}).strict()

export type IssueModel = z.infer<typeof IssueSchema>

export const IssueArraySchema = z.array(IssueSchema)

export function parseIssues(input: unknown): IssueModel[] {
  const res = IssueArraySchema.safeParse(input)
  if (!res.success) {
    throw new Error(res.error.message)
  }
  return res.data
}
