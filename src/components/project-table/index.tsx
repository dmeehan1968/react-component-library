import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectRow } from './types.ts'
import { formatAsYmdHm, sortRows, triState, type TriState } from './utils.ts'

export type ProjectTableProps = {
  rows: ProjectRow[]
  onRowsChange?: (next: ProjectRow[]) => void
  sortBy?: 'name' | 'updatedAt'
  sortDir?: 'asc' | 'desc'
  defaultSortBy?: 'name' | 'updatedAt'
  defaultSortDir?: 'asc' | 'desc'
  onSortChange?: (next: { sortBy: 'name' | 'updatedAt'; sortDir: 'asc' | 'desc' }) => void
  formatDate?: (value: Date) => string
}

// Root
function TableRoot(props: { children: any }) {
  return <table className="table w-full">{props.children}</table>
}

// Sort indicator
function SortIndicator({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  const base = 'inline-block ml-1 align-middle opacity-70'
  if (!active) return <span className={`${base}`}>↕</span>
  return <span className={`${base}`}>{dir === 'asc' ? '↑' : '↓'}</span>
}

// Header parts
function HeaderSelectAllCheckbox({ state, onToggle }: { state: TriState; onToggle: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some'
  }, [state])
  return (
    <input
      ref={ref}
      aria-checked={state === 'some' ? 'mixed' : state === 'all'}
      type="checkbox"
      className="checkbox"
      checked={state === 'all'}
      onChange={onToggle}
      data-testid="select-all"
    />
  )
}

function HeaderSortable(props: {
  id: 'name' | 'updatedAt'
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onToggle: (id: 'name' | 'updatedAt') => void
}) {
  const { id, label, active, dir, onToggle } = props
  return (
    <th aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className="btn btn-ghost btn-xs no-underline"
        onClick={() => onToggle(id)}
        data-testid={`sort-${id}`}
      >
        <span>{label}</span>
        <SortIndicator active={active} dir={dir} />
      </button>
    </th>
  )
}

function HeaderPlain({ label }: { label: string }) {
  return <th className="text-right">{label}</th>
}

function TableHead(props: {
  tri: TriState
  onToggleAll: () => void
  activeSort: { by: 'name' | 'updatedAt'; dir: 'asc' | 'desc' } | null
  onToggleSort: (id: 'name' | 'updatedAt') => void
}) {
  const active = props.activeSort
  const by = active?.by
  const dir = active?.dir ?? 'asc'
  return (
    <thead>
      <tr>
        <th className="w-10">
          <HeaderSelectAllCheckbox state={props.tri} onToggle={props.onToggleAll} />
        </th>
        <HeaderSortable id="name" label="Name" active={by === 'name'} dir={dir} onToggle={props.onToggleSort} />
        <HeaderSortable id="updatedAt" label="Last Updated" active={by === 'updatedAt'} dir={dir} onToggle={props.onToggleSort} />
        <HeaderPlain label="Issues" />
      </tr>
    </thead>
  )
}

// Row parts
function RowSelectCheckbox({ checked, onChange }: { checked?: boolean; onChange: () => void }) {
  return <input type="checkbox" className="checkbox" checked={!!checked} onChange={onChange} data-testid="row-select" />
}

function RowNameLink({ href, children }: { href: string; children: any }) {
  return (
    <a href={href} className="link link-primary" data-testid="row-name">
      {children}
    </a>
  )
}

function RowUpdatedAt({ value, fmt }: { value: Date; fmt: (d: Date) => string }) {
  return (
    <span className="tabular-nums" data-testid="row-updatedAt">
      {fmt(value)}
    </span>
  )
}

function RowIssueCount({ count }: { count: number }) {
  return (
    <span className="tabular-nums text-right block" data-testid="row-issueCount">
      {count}
    </span>
  )
}

function ProjectRowItem(props: {
  row: ProjectRow
  onToggleSelected: (id: string) => void
  formatDate: (d: Date) => string
}) {
  const { row } = props
  return (
    <tr>
      <td className="w-10">
        <RowSelectCheckbox checked={row.selected} onChange={() => props.onToggleSelected(row.id)} />
      </td>
      <td>
        <RowNameLink href={row.href}>{row.name}</RowNameLink>
      </td>
      <td>
        <RowUpdatedAt value={row.updatedAt} fmt={props.formatDate} />
      </td>
      <td className="text-right">
        <RowIssueCount count={row.issueCount} />
      </td>
    </tr>
  )
}

function TableBody(props: {
  rows: ProjectRow[]
  onToggleSelected: (id: string) => void
  formatDate: (d: Date) => string
}) {
  return (
    <tbody>
      {props.rows.map((r) => (
        <ProjectRowItem key={r.id} row={r} onToggleSelected={props.onToggleSelected} formatDate={props.formatDate} />
      ))}
    </tbody>
  )
}

function useSortState(
  controlled: { by?: 'name' | 'updatedAt'; dir?: 'asc' | 'desc' } | undefined,
  defaults: { by?: 'name' | 'updatedAt'; dir?: 'asc' | 'desc' },
): [state: { by: 'name' | 'updatedAt'; dir: 'asc' | 'desc' } | null, toggle: (id: 'name' | 'updatedAt') => void, set: (next: { by: 'name' | 'updatedAt'; dir: 'asc' | 'desc' } | null) => void] {
  const [uncontrolled, setUncontrolled] = useState<{ by: 'name' | 'updatedAt'; dir: 'asc' | 'desc' } | null>(
    defaults.by && defaults.dir ? { by: defaults.by, dir: defaults.dir } : null,
  )
  const isControlled = controlled && controlled.by && controlled.dir
  const state = isControlled ? ({ by: controlled!.by!, dir: controlled!.dir! } as const) : uncontrolled

  const setState = (next: { by: 'name' | 'updatedAt'; dir: 'asc' | 'desc' } | null) => {
    if (!isControlled) setUncontrolled(next)
  }

  const toggle = (id: 'name' | 'updatedAt') => {
    const cur = state
    if (!cur || cur.by !== id) setState({ by: id, dir: 'asc' })
    else setState({ by: id, dir: cur.dir === 'asc' ? 'desc' : 'asc' })
  }

  return [state, toggle, setState]
}

export function ProjectTable(props: ProjectTableProps) {
  const format = props.formatDate ?? formatAsYmdHm

  // selection control
  const selectionControlled = !!props.onRowsChange
  const [localRows, setLocalRows] = useState<ProjectRow[]>(props.rows)
  useEffect(() => {
    if (selectionControlled) return
    setLocalRows(props.rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.rows])

  const rows = selectionControlled ? props.rows : localRows

  const [sortState, toggleSort, setSortState] = useSortState(
    props.sortBy && props.sortDir ? { by: props.sortBy, dir: props.sortDir } : undefined,
    { by: props.defaultSortBy, dir: props.defaultSortDir },
  )

  const sortedRows = useMemo(() => {
    if (!sortState) return rows
    return sortRows(rows, sortState.by, sortState.dir)
  }, [rows, sortState])

  const tri: TriState = useMemo(() => {
    const sel = rows.filter((r) => !!r.selected).length
    return triState(sel, rows.length)
  }, [rows])

  const emitRows = (next: ProjectRow[]) => {
    if (selectionControlled && props.onRowsChange) props.onRowsChange(next)
    else setLocalRows(next)
  }

  const handleToggleAll = () => {
    const nextSel = tri === 'none' ? true : false
    const next = rows.map((r) => ({ ...r, selected: nextSel }))
    emitRows(next)
  }

  const handleToggleRow = (id: string) => {
    const next = rows.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    emitRows(next)
  }

  const handleToggleSort = (id: 'name' | 'updatedAt') => {
    let next: { by: 'name' | 'updatedAt'; dir: 'asc' | 'desc' }
    if (!sortState || sortState.by !== id) next = { by: id, dir: 'asc' }
    else next = { by: id, dir: sortState.dir === 'asc' ? 'desc' : 'asc' }

    setSortState(next)
    props.onSortChange?.(next)
  }

  const activeSort = sortState ? { by: sortState.by, dir: sortState.dir } : null

  return (
    <TableRoot>
      <TableHead tri={tri} onToggleAll={handleToggleAll} activeSort={activeSort} onToggleSort={handleToggleSort} />
      <TableBody rows={sortedRows} onToggleSelected={handleToggleRow} formatDate={format} />
    </TableRoot>
  )
}

export default ProjectTable
