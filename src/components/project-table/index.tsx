import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectRow, ProjectTableProps, SortBy, SortDir } from './types'
import { formatAsYmdHm, sortRows, triState } from './utils'

function useControlledState<T>(controlled: T | undefined, defaultValue: T) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? (controlled as T) : uncontrolled
  return [value, setUncontrolled, isControlled] as const
}

export function ProjectTable({
  rows,
  onRowsChange,
  sortBy,
  sortDir,
  defaultSortBy = 'name',
  defaultSortDir = 'asc',
  onSortChange,
  formatDate,
}: ProjectTableProps) {
  // Selection: controlled via rows+onRowsChange, otherwise internal copy
  const [innerRows, setInnerRows] = useState<ProjectRow[]>(rows)
  useEffect(() => setInnerRows(rows), [rows])
  const rowsSource = onRowsChange ? rows : innerRows

  // Sorting: controlled or uncontrolled
  const [by, setBy, byControlled] = useControlledState<SortBy>(sortBy, defaultSortBy)
  const [dir, setDir, dirControlled] = useControlledState<SortDir>(sortDir, defaultSortDir)

  const applySortChange = (next: { sortBy: SortBy; sortDir: SortDir }) => {
    if (onSortChange) onSortChange(next)
    if (!byControlled) setBy(next.sortBy)
    if (!dirControlled) setDir(next.sortDir)
  }

  const sorted = useMemo(() => sortRows([...rowsSource], by, dir), [rowsSource, by, dir])

  const selectedCount = sorted.filter((r) => !!r.selected).length
  const headerState: 'all' | 'some' | 'none' = triState(selectedCount, sorted.length)

  const toggleHeader = () => {
    const nextSelected = headerState === 'none'
    const next = sorted.map((r) => ({ ...r, selected: nextSelected }))
    if (onRowsChange) onRowsChange(next)
    else setInnerRows(next)
  }

  const toggleRow = (id: string) => {
    const next = sorted.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    if (onRowsChange) onRowsChange(next)
    else setInnerRows(next)
  }

  const toggleSort = (id: SortBy) => {
    if (id === by) {
      applySortChange({ sortBy: id, sortDir: dir === 'asc' ? 'desc' : 'asc' })
    } else {
      applySortChange({ sortBy: id, sortDir: 'asc' })
    }
  }

  const fmt = formatDate ?? formatAsYmdHm

  return (
    <TableRoot>
      <TableHead
        headerState={headerState}
        onToggleHeader={toggleHeader}
        sort={{ by, dir }}
        onToggleSort={toggleSort}
      />
      <TableBody rows={sorted} onToggleSelected={toggleRow} formatDate={fmt} />
    </TableRoot>
  )
}

function TableRoot({ children }: { children: React.ReactNode }) {
  return (
    <table className="table w-full">
      {children}
    </table>
  )
}

function TableHead({
  headerState,
  onToggleHeader,
  sort,
  onToggleSort,
}: {
  headerState: 'all' | 'some' | 'none'
  onToggleHeader: () => void
  sort: { by: SortBy; dir: SortDir }
  onToggleSort: (id: SortBy) => void
}) {
  return (
    <thead>
      <tr>
        <th className="w-[40px]">
          <HeaderSelectAllCheckbox state={headerState} onToggle={onToggleHeader} />
        </th>
        <HeaderSortable
          id="name"
          label="Name"
          active={sort.by === 'name'}
          dir={sort.dir}
          onToggle={onToggleSort}
        />
        <HeaderSortable
          id="updatedAt"
          label="Last Updated"
          active={sort.by === 'updatedAt'}
          dir={sort.dir}
          onToggle={onToggleSort}
        />
        <HeaderPlain label="Issues" />
      </tr>
    </thead>
  )
}

function HeaderPlain({ label }: { label: string }) {
  return <th className="text-right">{label}</th>
}

function HeaderSortable({
  id,
  label,
  active,
  dir,
  onToggle,
}: {
  id: SortBy
  label: string
  active: boolean
  dir: SortDir
  onToggle: (id: SortBy) => void
}) {
  const ariaSort = active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'
  return (
    <th aria-sort={ariaSort as never}>
      <button
        type="button"
        className={`btn btn-ghost btn-xs gap-2 ${active ? 'opacity-100' : 'opacity-70'}`}
        onClick={() => onToggle(id)}
      >
        <span>{label}</span>
        <SortIndicator active={active} dir={dir} />
      </button>
    </th>
  )
}

function HeaderSelectAllCheckbox({
  state,
  onToggle,
}: {
  state: 'all' | 'some' | 'none'
  onToggle: () => void
}) {
  const ref = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some'
  }, [state])
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-checked={state === 'some' ? 'mixed' : state === 'all'}
      className="checkbox"
      checked={state === 'all'}
      onChange={onToggle}
      data-testid="select-all"
    />
  )
}

function TableBody({
  rows,
  onToggleSelected,
  formatDate,
}: {
  rows: ProjectRow[]
  onToggleSelected: (id: string) => void
  formatDate: (d: Date) => string
}) {
  return (
    <tbody>
      {rows.map((row) => (
        <ProjectRowItem key={row.id} row={row} onToggleSelected={onToggleSelected} formatDate={formatDate} />
      ))}
    </tbody>
  )
}

function ProjectRowItem({
  row,
  onToggleSelected,
  formatDate,
}: {
  row: ProjectRow
  onToggleSelected: (id: string) => void
  formatDate: (d: Date) => string
}) {
  return (
    <tr>
      <td className="w-[40px]">
        <RowSelectCheckbox checked={!!row.selected} onChange={() => onToggleSelected(row.id)} />
      </td>
      <td>
        <RowNameLink href={row.href}>{row.name}</RowNameLink>
      </td>
      <td className="tabular-nums">
        <RowUpdatedAt value={row.updatedAt} formatDate={formatDate} />
      </td>
      <td className="text-right tabular-nums">{row.issueCount}</td>
    </tr>
  )
}

function RowSelectCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <input type="checkbox" className="checkbox" checked={checked} onChange={onChange} />
}

function RowNameLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="link" href={href} target="_self" rel="noreferrer">
      {children}
    </a>
  )
}

function RowUpdatedAt({ value, formatDate }: { value: Date; formatDate: (d: Date) => string }) {
  return <span>{formatDate(value)}</span>
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="opacity-40">↕︎</span>
  return <span>{dir === 'asc' ? '▲' : '▼'}</span>
}

export default ProjectTable
