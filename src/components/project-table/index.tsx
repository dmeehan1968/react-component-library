import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectRow } from './types.ts'
import { formatAsYmdHm, sortRows, triState, type TriState } from './utils.ts'

export type SortKey = 'name' | 'updatedAt'
export type SortDir = 'asc' | 'desc'

export interface ProjectTableProps {
  rows: (Omit<ProjectRow, 'updatedAt'> & { updatedAt: Date | string })[]
  onRowsChange?: (next: ProjectRow[]) => void
  sortBy?: SortKey
  sortDir?: SortDir
  defaultSortBy?: SortKey
  defaultSortDir?: SortDir
  onSortChange?: (next: { sortBy: SortKey; sortDir: SortDir }) => void
  formatDate?: (value: Date) => string
}

// ---------- Top-level component
export default function ProjectTable({
  rows,
  onRowsChange,
  sortBy: sortByCtrl,
  sortDir: sortDirCtrl,
  defaultSortBy = 'name',
  defaultSortDir = 'asc',
  onSortChange,
  formatDate = formatAsYmdHm,
}: ProjectTableProps) {
  // normalize dates and ensure we work with ProjectRow[] internally
  const normalizedRows: ProjectRow[] = useMemo(() => {
    return rows.map((r) => ({ ...r, updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt) }))
  }, [rows])

  // uncontrolled sorting
  const [sortState, setSortState] = useState<{ sortBy: SortKey; sortDir: SortDir }>({ sortBy: defaultSortBy, sortDir: defaultSortDir })
  const sortBy = sortByCtrl ?? sortState.sortBy
  const sortDir = sortDirCtrl ?? sortState.sortDir

  const setSort = (by: SortKey) => {
    const next: { sortBy: SortKey; sortDir: SortDir } =
      by === sortBy ? { sortBy, sortDir: sortDir === 'asc' ? 'desc' : 'asc' } : { sortBy: by, sortDir: 'asc' }
    if (onSortChange) onSortChange(next)
    if (sortByCtrl == null || sortDirCtrl == null) setSortState(next)
  }

  const sortedRows = useMemo(() => sortRows(normalizedRows, sortBy, sortDir), [normalizedRows, sortBy, sortDir])

  // selection control
  const selectedCount = useMemo(() => sortedRows.filter((r) => !!r.selected).length, [sortedRows])
  const headerState: TriState = triState(selectedCount, sortedRows.length)

  const emitRows = (next: ProjectRow[]) => {
    onRowsChange?.(next)
  }

  const setAll = (checked: boolean) => {
    const next = sortedRows.map((r) => ({ ...r, selected: checked }))
    emitRows(next)
  }

  const toggleOne = (id: string) => {
    const next = sortedRows.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    emitRows(next)
  }

  return (
    <TableRoot>
      <TableHead
        state={headerState}
        onToggle={() => setAll(headerState === 'none')}
        sortState={{ sortBy, sortDir }}
        onToggleSort={setSort}
      />
      <TableBody rows={sortedRows} onToggleSelected={toggleOne} formatDate={formatDate} />
    </TableRoot>
  )
}

// ---------- Subcomponents
function TableRoot({ children }: { children: React.ReactNode }) {
  return <table className="table w-full">{children}</table>
}

function TableHead({
  state,
  onToggle,
  sortState,
  onToggleSort,
}: {
  state: TriState
  onToggle: () => void
  sortState: { sortBy: SortKey; sortDir: SortDir }
  onToggleSort: (id: SortKey) => void
}) {
  const { sortBy, sortDir } = sortState
  return (
    <thead>
      <tr>
        <th className="w-10">
          <HeaderSelectAllCheckbox state={state} onToggle={onToggle} />
        </th>
        <HeaderSortable id="name" active={sortBy === 'name'} dir={sortDir} onToggle={onToggleSort}>
          Name
        </HeaderSortable>
        <HeaderSortable id="updatedAt" active={sortBy === 'updatedAt'} dir={sortDir} onToggle={onToggleSort}>
          Last Updated
        </HeaderSortable>
        <HeaderPlain>Issue Count</HeaderPlain>
      </tr>
    </thead>
  )
}

function HeaderSelectAllCheckbox({ state, onToggle }: { state: TriState; onToggle: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some'
  }, [state])
  const ariaChecked: boolean | 'mixed' = state === 'some' ? 'mixed' : state === 'all'
  const checked = state === 'all'
  return (
    <input
      ref={ref}
      type="checkbox"
      className="checkbox"
      aria-checked={ariaChecked}
      checked={checked}
      onChange={onToggle}
      data-testid="select-all"
    />
  )
}

function HeaderSortable({ id, active, dir, onToggle, children }: { id: SortKey; active: boolean; dir: SortDir; onToggle: (id: SortKey) => void; children: React.ReactNode }) {
  return (
    <th aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="btn btn-ghost btn-sm no-animation" onClick={() => onToggle(id)} data-testid={`sort-${id}`}>
        <span className="mr-1">{children}</span>
        <SortIndicator active={active} dir={dir} />
      </button>
    </th>
  )
}

function HeaderPlain({ children }: { children: React.ReactNode }) {
  return <th className="text-right">{children}</th>
}

function TableBody({ rows, onToggleSelected, formatDate }: { rows: ProjectRow[]; onToggleSelected: (id: string) => void; formatDate: (d: Date) => string }) {
  return (
    <tbody>
      {rows.map((row) => (
        <ProjectRowItem key={row.id} row={row} onToggleSelected={onToggleSelected} formatDate={formatDate} />)
      )}
    </tbody>
  )
}

function ProjectRowItem({ row, onToggleSelected, formatDate }: { row: ProjectRow; onToggleSelected: (id: string) => void; formatDate: (d: Date) => string }) {
  return (
    <tr data-testid={`row-${row.id}`}>
      <RowSelectCheckbox checked={!!row.selected} onChange={() => onToggleSelected(row.id)} />
      <RowNameLink name={row.name} href={row.href} />
      <RowUpdatedAt date={row.updatedAt} formatDate={formatDate} />
      <RowIssueCount count={row.issueCount} />
    </tr>
  )
}

function RowSelectCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <td className="w-10">
      <input type="checkbox" className="checkbox" checked={checked} onChange={onChange} />
    </td>
  )
}

function RowNameLink({ name, href }: { name: string; href: string }) {
  return (
    <td>
      <a className="link link-primary" href={href} data-testid="name-link">
        {name}
      </a>
    </td>
  )
}

function RowUpdatedAt({ date, formatDate }: { date: Date; formatDate: (d: Date) => string }) {
  return <td className="tabular-nums">{formatDate(date)}</td>
}

function RowIssueCount({ count }: { count: number }) {
  return <td className="text-right tabular-nums">{count}</td>
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  const cls = active ? (dir === 'asc' ? '▲' : '▼') : '—'
  return <span aria-hidden="true" data-testid="sort-indicator">{cls}</span>
}
