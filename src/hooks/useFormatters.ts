import * as React from "react"
import { useLocale } from "./useLocale.tsx"

export type Formatters = {
  formatTokens: (n: number) => string
  formatCost: (n: number) => string
  formatHMS: (seconds: number) => string
  formatTimestamp: (d: Date) => string
}

/**
 * Locale-aware formatters shared across issues table and totals rows.
 * Implements the same behavior that previously lived inside the issues table.
 */
export const useFormatters = (): Formatters => {
  const locale = useLocale()
  const intFmt = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const twoDpFmt = React.useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale],
  )
  const formatTokens = React.useCallback((n: number) => intFmt.format(n), [intFmt])
  const formatCost = React.useCallback((n: number) => twoDpFmt.format(n), [twoDpFmt])
  const formatHMS = React.useCallback((totalSeconds: number) => {
    const seconds = Math.max(0, Math.floor(totalSeconds))
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const pad = (v: number) => v.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }, [])
  const formatTimestamp = React.useCallback((d: Date) => d.toLocaleString(locale), [locale])
  return { formatTokens, formatCost, formatHMS, formatTimestamp }
}
