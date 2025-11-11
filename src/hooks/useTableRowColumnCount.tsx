import * as React from "react"

export const useTableRowColumnCount = () => {
  const headerRowRef = React.useRef<HTMLTableRowElement | null>(null)
  const [columnCount, setColumnCount] = React.useState(1)

  React.useEffect(() => {
    if (!headerRowRef.current) return

    const cells = Array.from(headerRowRef.current.cells)
    const count = cells.reduce((sum, cell) => sum + (cell.colSpan || 1), 0)

    setColumnCount(count)
  }, [])

  return { headerRowRef, columnCount }
}