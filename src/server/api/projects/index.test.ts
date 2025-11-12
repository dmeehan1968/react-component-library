import { describe, it, expect } from 'bun:test'
import { deriveProjectStats } from './index.ts'
import { issuesByProject } from '../issues/issues.data.ts'

describe('deriveProjectStats', () => {
  it('computes issueCount and most recent lastUpdated for design-tokens', () => {
    const stats = deriveProjectStats(issuesByProject)
    const dt = stats['design-tokens']
    expect(dt).toBeDefined()
    expect(dt.issueCount).toBe(10)
    expect(dt.lastUpdated).toBe('2025-11-09T09:30:00.000Z')
  })

  it('computes issueCount and most recent lastUpdated for docs-site', () => {
    const stats = deriveProjectStats(issuesByProject)
    const ds = stats['docs-site']
    expect(ds).toBeDefined()
    expect(ds.issueCount).toBe(10)
    expect(ds.lastUpdated).toBe('2025-11-11T18:22:00.000Z')
  })
})
