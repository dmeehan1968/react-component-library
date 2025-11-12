// Issues-table test IDs — generated via shared `createTestIds` util.
// NOTE: Values kept identical to previous constants to avoid DOM changes.
import { createTestIds } from "../../testing/ids.ts"

export const T = createTestIds(
  'issues-table',
  {
    columns: [
      'select',
      'issue',
      'description',
      'timestamp',
      'inputTokens',
      'outputTokens',
      'cacheTokens',
      'cost',
      'time',
      'status',
    ],
    rows: {
      bodyIssue: 'issue',
      totalsHeader: 'totals-header',
      totalsFooter: 'totals-footer',
    },
    messages: ['loading', 'error', 'noData'],
    checkbox: ['header', 'row'],
  },
  {
    columnCellExclusions: ['select'],
  },
)

export type IssuesTableTestIds = typeof T
