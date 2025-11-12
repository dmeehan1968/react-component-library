import { describe, it, expect } from 'bun:test'
import { sortByTimestampDesc, toTime } from './issuesProvider.tsx'
import type { Issue } from './issuesContext.tsx'

describe('sortByTimestampDesc', () => {
  it('sorts ISO string timestamps descending', () => {
    const issues: Issue[] = [
      { id: '1', title: 'a', url: '', project: 'p', description: '', timestamp: '2025-01-01T00:00:00.000Z', inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
      { id: '2', title: 'b', url: '', project: 'p', description: '', timestamp: '2025-02-01T00:00:00.000Z', inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
      { id: '3', title: 'c', url: '', project: 'p', description: '', timestamp: '2024-12-31T23:59:59.000Z', inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
    ]
    const sorted = sortByTimestampDesc(issues)
    expect(sorted.map((i) => i.id)).toEqual(['2', '1', '3'])
  })

  it('handles Dates and invalid values without throwing', () => {
    const issues = [
      // @ts-expect-error: intentionally pass a Date to ensure robustness
      { id: '1', title: 'a', url: '', project: 'p', description: '', timestamp: new Date('2025-01-01T00:00:00.000Z'), inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
      { id: 'x', title: 'x', url: '', project: 'p', description: '', timestamp: 'not-a-date', inputTokens: 0, outputTokens: 0, cacheTokens: 0, cost: 0, time: 0, status: 'queued' },
    ] as unknown as Issue[]
    const sorted = sortByTimestampDesc(issues)
    expect(Array.isArray(sorted)).toBe(true)
  })
})

describe('toTime', () => {
  it('parses ISO strings and returns 0 for invalid inputs', () => {
    expect(toTime('2025-01-01T00:00:00.000Z')).toBeGreaterThan(0)
    expect(toTime('not-a-date')).toBe(0)
    expect(toTime(undefined)).toBe(0)
  })
})
