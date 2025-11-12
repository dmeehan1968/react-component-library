import { describe, expect, it } from 'bun:test'
import { createTestIds, toKebabCase } from './ids'

describe('toKebabCase', () => {
  it('converts camelCase and spaces/underscores to kebab-case', () => {
    expect(toKebabCase('inputTokens')).toBe('input-tokens')
    expect(toKebabCase('OutputTokens')).toBe('output-tokens')
    expect(toKebabCase('cache tokens')).toBe('cache-tokens')
    expect(toKebabCase('cost_tokens')).toBe('cost-tokens')
    expect(toKebabCase('Time')).toBe('time')
  })
})

describe('createTestIds', () => {
  it('generates IDs matching the Issues Table patterns (no prefix)', () => {
    const ids = createTestIds('issues-table', {
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
      // rows allow aliasing token for non-1:1 names
      rows: {
        bodyIssue: 'issue',
        totalsHeader: 'totals-header',
        totalsFooter: 'totals-footer',
      },
      messages: ['loading', 'error', 'noData'],
      checkbox: ['header', 'row'],
    }, {
      columnCellExclusions: ['select'],
    })

    // columns headers
    expect(ids.columns.select.header).toBe('select-column')
    expect(ids.columns.issue.header).toBe('issue-column')
    expect(ids.columns.description.header).toBe('description-column')
    expect(ids.columns.timestamp.header).toBe('timestamp-column')
    expect(ids.columns.inputTokens.header).toBe('input-tokens-column')
    expect(ids.columns.outputTokens.header).toBe('output-tokens-column')
    expect(ids.columns.cacheTokens.header).toBe('cache-tokens-column')
    expect(ids.columns.cost.header).toBe('cost-column')
    expect(ids.columns.time.header).toBe('time-column')
    expect(ids.columns.status.header).toBe('status-column')

    // column cells (select omitted)
    expect(ids.columns.issue.cell).toBe('issue')
    expect(ids.columns.description.cell).toBe('description')
    expect(ids.columns.timestamp.cell).toBe('timestamp')
    expect(ids.columns.inputTokens.cell).toBe('input-tokens')
    expect(ids.columns.outputTokens.cell).toBe('output-tokens')
    expect(ids.columns.cacheTokens.cell).toBe('cache-tokens')
    expect(ids.columns.cost.cell).toBe('cost')
    expect(ids.columns.time.cell).toBe('time')
    expect(ids.columns.status.cell).toBe('status')

    // rows
    expect(ids.rows.bodyIssue).toBe('issue-row')
    expect(ids.rows.totalsHeader).toBe('totals-header-row')
    expect(ids.rows.totalsFooter).toBe('totals-footer-row')

    // messages
    expect(ids.messages.loading).toBe('loading-message')
    expect(ids.messages.error).toBe('error-message')
    expect(ids.messages.noData).toBe('no-data-message')

    // checkbox
    expect(ids.checkbox.header).toBe('header-select-checkbox')
    expect(ids.checkbox.row).toBe('row-select-checkbox')
  })

  it('can add a namespacing prefix via valuePrefix option', () => {
    const ids = createTestIds('issues-table', {
      columns: ['issue'],
      rows: { bodyIssue: 'issue' },
      messages: ['loading'],
      checkbox: ['header'],
    }, {
      valuePrefix: (group, token, variant) => `issues-table__${group}${variant ? `-${variant}` : ''}--${token}`,
    })

    expect(ids.columns.issue.header).toBe('issues-table__col-header--issue-column')
    expect(ids.columns.issue.cell).toBe('issues-table__cell-cell--issue')
    expect(ids.rows.bodyIssue).toBe('issues-table__row--issue-row')
    expect(ids.messages.loading).toBe('issues-table__msg--loading-message')
    expect(ids.checkbox.header).toBe('issues-table__checkbox--header-select-checkbox')
  })
})
