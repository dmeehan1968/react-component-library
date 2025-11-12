import { describe, expect, it } from 'bun:test'
import type { Issue } from './issuesContext.tsx'
import { sortByTimestampDesc } from "./sortByTimestampDesc.tsx"


describe('sortByTimestampDesc', () => {
  it('sorts timestamps (Date) descending', () => {
    const issues: Issue[] = [
      { id: '1', title: 'a', url: '', project: 'p', timestamp: new Date('2025-01-01T00:00:00.000Z'), inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
      { id: '2', title: 'b', url: '', project: 'p', timestamp: new Date('2025-02-01T00:00:00.000Z'), inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
      { id: '3', title: 'c', url: '', project: 'p', timestamp: new Date('2024-12-31T23:59:59.000Z'), inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
    ]
    const sorted = sortByTimestampDesc(issues)
    expect(sorted.map((i) => i.id)).toEqual(['2', '1', '3'])
  })

  it('handles valid dates without throwing', () => {
    const issues: Issue[] = [
      { id: '1', title: 'a', url: '', project: 'p', timestamp: new Date('2025-01-01T00:00:00.000Z'), inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
    ]
    const sorted = sortByTimestampDesc(issues)
    expect(Array.isArray(sorted)).toBe(true)
  })
})
