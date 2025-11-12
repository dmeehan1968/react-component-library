// Shared utilities for generating stable test IDs
// Semantics↑ Duplication↓ Modularity↑

export type KeyRecord = Record<string, string>
export type KeyTuple = readonly [key: string, token: string]
export type KeyArray = readonly string[]
export type KeySpec = KeyArray | KeyRecord | readonly KeyTuple[]

export type CreateTestIdsSpec = {
  // Column keys. Each key yields `{ header, cell? }`.
  // If `columnCellExclusions` includes a key, `cell` will be omitted.
  columns?: KeySpec
  // Row keys. Each key yields an id string.
  rows?: KeySpec
  // Message keys. Each key yields an id string.
  messages?: KeySpec
  // Checkbox keys (e.g., header, row). Each key yields an id string.
  checkbox?: KeySpec
}

export type CreateTestIdsOptions = {
  // Keys for which the column `cell` id should NOT be generated (e.g., 'select').
  columnCellExclusions?: readonly string[]
  // Optional prefix strategy for values. Defaults to no prefix to preserve existing IDs.
  // Example future switch: valuePrefix: (group, token, variant?) => `issues-table__${group}--${token}`
  valuePrefix?: (group: string, token: string, variant?: string) => string
}

export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase → camel-Case
    .replace(/[^a-zA-Z0-9]+/g, '-') // spaces/underscores → '-'
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function normalize(spec?: KeySpec): Array<KeyTuple> {
  if (!spec) return []
  if (Array.isArray(spec)) {
    // string[] or [key, token][]
    if (spec.length > 0 && Array.isArray(spec[0])) {
      return (spec as readonly KeyTuple[]).map(([key, token]) => [String(key), String(token)])
    }
    return (spec as KeyArray).map((key) => [key, toKebabCase(key)])
  }
  // Record<string, string>
  return Object.entries(spec).map(([key, token]) => [key, toKebabCase(token)])
}

function withPrefix(
  group: string,
  token: string,
  valuePrefix?: CreateTestIdsOptions['valuePrefix'],
  variant?: string,
): string {
  if (valuePrefix) return valuePrefix(group, token, variant)
  // default: no prefix to preserve current IDs across the app
  return token
}

export function createTestIds<TSpec extends CreateTestIdsSpec>(
  base: string, // reserved for future namespacing; not used in default strategy
  spec: TSpec,
  options: CreateTestIdsOptions = {},
) {
  const { columnCellExclusions = [], valuePrefix } = options
  const excludeSet = new Set(columnCellExclusions)

  const colEntries = normalize(spec.columns)
  const rowEntries = normalize(spec.rows)
  const msgEntries = normalize(spec.messages)
  const cbxEntries = normalize(spec.checkbox)

  const columns = Object.fromEntries(
    colEntries.map(([key, token]) => {
      const header = withPrefix('col', `${token}-column`, valuePrefix, 'header')
      if (excludeSet.has(key)) {
        return [key, { header }]
      }
      const cell = withPrefix('cell', token, valuePrefix, 'cell')
      return [key, { header, cell }]
    }),
  ) as Record<string, { header: string; cell?: string }>

  const rows = Object.fromEntries(
    rowEntries.map(([key, token]) => [key, withPrefix('row', `${token}-row`, valuePrefix)]),
  ) as Record<string, string>

  const messages = Object.fromEntries(
    msgEntries.map(([key, token]) => [key, withPrefix('msg', `${token}-message`, valuePrefix)]),
  ) as Record<string, string>

  const checkbox = Object.fromEntries(
    cbxEntries.map(([key, token]) => [key, withPrefix('checkbox', `${token}-select-checkbox`, valuePrefix)]),
  ) as Record<string, string>

  const result = Object.freeze({ base, columns, rows, messages, checkbox })
  return result as Readonly<typeof result>
}

export type CreateTestIdsReturn = ReturnType<typeof createTestIds>
