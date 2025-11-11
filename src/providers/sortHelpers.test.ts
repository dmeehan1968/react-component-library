import { describe, expect, it } from 'bun:test'
import type { Project } from "./projectsContext.tsx"
import { projectSort } from './sortHelpers.tsx'

const fixtures = (): Project[] => [
  {
    name: "Zebra",
    url: "https://example.com/zebra",
    lastUpdated: new Date("2024-03-05T12:00:00Z"),
    issueCount: 3,
  },
  {
    name: "apple",
    url: "https://example.com/apple",
    lastUpdated: new Date("2024-01-01T00:00:00Z"),
    issueCount: 1,
  },
  {
    name: "Banana",
    url: "https://example.com/banana",
    lastUpdated: new Date("2024-07-15T08:30:00Z"),
    issueCount: 2,
  },
  {
    name: "aardvark",
    url: "https://example.com/aardvark",
    lastUpdated: new Date("2023-12-31T23:59:59Z"),
    issueCount: 0,
  },
]

const names = (list: Project[]): string[] => list.map((p) => p.name)
const times = (list: Project[]): number[] => list.map((p) => p.lastUpdated.getTime())

describe('projectSort', () => {
  it('sorts by name ascending (locale-aware) and does not mutate input', () => {
    const input = fixtures()
    const originalSnapshot = [...input]

    const result = projectSort(input, 'name', 'asc')

    // Expect a new array instance and original left intact
    expect(result).not.toBe(input)
    expect(input).toEqual(originalSnapshot)

    // Locale-aware expected ordering based on names using the same comparator semantics
    const expectedNames = [...names(input)].sort((a, b) => a.localeCompare(b))
    expect(names(result)).toEqual(expectedNames)
  })

  it('sorts by name descending (locale-aware)', () => {
    const input = fixtures()
    const asc = projectSort(input, 'name', 'asc')
    const desc = projectSort(input, 'name', 'desc')

    expect(names(desc)).toEqual(names(asc).reverse())
  })

  it('sorts by lastUpdated ascending', () => {
    const input = fixtures()
    const result = projectSort(input, 'lastUpdated', 'asc')
    const expectedTimes = [...times(input)].sort((a, b) => a - b)
    expect(times(result)).toEqual(expectedTimes)
  })

  it('sorts by lastUpdated descending', () => {
    const input = fixtures()
    const result = projectSort(input, 'lastUpdated', 'desc')
    const expectedTimes = times(input).sort((a, b) => b - a)
    expect(times(result)).toEqual(expectedTimes)
  })

  it('returns empty array when given empty array', () => {
    const resultByName = projectSort([], 'name', 'asc')
    const resultByLastUpdated = projectSort([], 'lastUpdated', 'desc')
    expect(resultByName).toEqual([])
    expect(resultByLastUpdated).toEqual([])
  })
})
