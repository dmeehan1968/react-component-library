import * as React from "react"
import { describe, expect, test } from 'bun:test'
import { render, within } from "@testing-library/react"
import { useFormatters } from "./useFormatters.ts"

const Probe: React.FC<{ n: number; money: number; seconds: number; date: Date }> = ({ n, money, seconds, date }) => {
  const { formatTokens, formatCost, formatHMS, formatTimestamp } = useFormatters()
  return (
    <div>
      <span data-testid="tokens">{formatTokens(n)}</span>
      <span data-testid="cost">{formatCost(money)}</span>
      <span data-testid="hms">{formatHMS(seconds)}</span>
      <span data-testid="ts">{formatTimestamp(date)}</span>
    </div>
  )
}

describe("useFormatters", () => {
  test("formats tokens and cost using locale-aware number formats", () => {
    const n = 1234567
    const money = 12.345
    const { container } = render(<Probe n={n} money={money} seconds={0} date={new Date(0)} />)

    const locale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US'
    const intFmt = new Intl.NumberFormat(locale)
    const twoDpFmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const scoped = within(container)
    expect(scoped.getByTestId('tokens').textContent).toBe(intFmt.format(n))
    expect(scoped.getByTestId('cost').textContent).toBe(twoDpFmt.format(money))
  })

  test("formats HMS and clamps negative seconds to 0", () => {
    const { container, rerender } = render(<Probe n={0} money={0} seconds={3665} date={new Date(0)} />)
    expect(within(container).getByTestId('hms').textContent).toBe('01:01:05')
    rerender(<Probe n={0} money={0} seconds={-10} date={new Date(0)} />)
    expect(within(container).getByTestId('hms').textContent).toBe('00:00:00')
  })

  test("formats timestamp using locale", () => {
    const d = new Date('2024-01-02T03:04:05Z')
    const { container } = render(<Probe n={0} money={0} seconds={0} date={d} />)
    const locale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US'
    expect(within(container).getByTestId('ts').textContent).toBe(d.toLocaleString(locale))
  })
})
