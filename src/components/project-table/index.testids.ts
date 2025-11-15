// Project-table test IDs — generated via shared `createTestIds` util.
// Keep values identical to previous constants to avoid DOM changes.
import { createTestIds } from "../../testing/ids.ts"

export const T = createTestIds(
  'projects-table',
  {
    columns: [
      'name',
      'lastUpdated',
      'issueCount',
      'ideNames',
    ],
    rows: {
      project: 'project',
    },
    messages: ['loading', 'error', 'noData'],
  },
  {
    // Preserve legacy IDs: remove "-row" suffix for rows only; leave others unchanged.
    valuePrefix: (group, token) => group === 'row' ? token.replace(/-row$/, '') : token,
  },
)

export const sortIndicatorId = 'sort-indicator'

export type ProjectsTableTestIds = typeof T