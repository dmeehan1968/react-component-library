import { expect } from '@playwright/experimental-ct-react'
import type { Locator } from '@playwright/test'

type TWSize = {
  kind: 'w' | 'min-w' | 'h' | 'min-h'
  token: string
}

function extractSizeTokens(className: string): TWSize[] {
  const tokens: TWSize[] = []
  const classes = className.split(/\s+/).filter(Boolean)
  for (const cls of classes) {
    if (cls.startsWith('w-')) tokens.push({ kind: 'w', token: cls.slice(2) })
    else if (cls.startsWith('min-w-')) tokens.push({ kind: 'min-w', token: cls.slice(6) })
    else if (cls.startsWith('h-')) tokens.push({ kind: 'h', token: cls.slice(2) })
    else if (cls.startsWith('min-h-')) tokens.push({ kind: 'min-h', token: cls.slice(6) })
  }
  return tokens
}

function isNumericToken(tok: string): boolean {
  return /^\d+$/.test(tok)
}

function numericValue(tok: string): number | null {
  return isNumericToken(tok) ? Number(tok) : null
}

function getFirst(tokens: TWSize[], kind: TWSize['kind']): TWSize | undefined {
  return tokens.find((t) => t.kind === kind)
}

function computeRatioFromTokens(tokens: TWSize[], wKind: 'w' | 'min-w', hKind: 'h' | 'min-h') {
  const wTok = getFirst(tokens, wKind)?.token
  const hTok = getFirst(tokens, hKind)?.token
  if (!wTok || !hTok) return null
  const w = numericValue(wTok)
  const h = numericValue(hTok)
  if (w == null || h == null || h === 0) return null
  return w / h
}

function hasWidthSet(tokens: TWSize[]): boolean {
  return tokens.some((t) => t.kind === 'w' || t.kind === 'min-w')
}

async function readClassName(target: Locator): Promise<string> {
  // Use first match in case the locator matches multiple nodes
  const nth = target.first()
  const count = await target.count()
  // If the element is detached, Playwright will throw here, which is fine
  const className = await nth.evaluate((el) => (el as HTMLElement).className || '')
  // Include match count in message via a hidden property we return alongside
  return className + (count > 1 ? ` /*matched ${count} nodes, used first*/` : '')
}

expect.extend({
  async toHaveContainerRatio(received: Locator, ratio: number) {
    if (!received || typeof (received as any).evaluate !== 'function') {
      return {
        pass: false,
        message: () => `toHaveContainerRatio can only be used on a Playwright Locator. Received: ${String(received)}`,
      }
    }

    if (!isFinite(ratio) || ratio <= 0) {
      return {
        pass: false,
        message: () => `Invalid ratio: ${String(ratio)}. Ratio must be a positive finite number.`,
      }
    }

    const className = await readClassName(received)
    const tokens = extractSizeTokens(className)

    const ratios: Array<{ label: string; value: number | null }> = [
      { label: 'w/h', value: computeRatioFromTokens(tokens, 'w', 'h') },
      { label: 'min-w/min-h', value: computeRatioFromTokens(tokens, 'min-w', 'min-h') },
    ]

    const match = ratios.find((r) => r.value != null && (r.value as number) >= ratio)

    const pass = Boolean(match)
    const printable = () => {
      const details = ratios.map((r) => `${r.label}: ${r.value == null ? 'n/a' : r.value.toFixed(3)}`).join(', ')
      return `${details}`
    }

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have container ratio >= ${ratio}, but it did (${printable()}).`
          : `Expected element to have container ratio >= ${ratio} using either (w/h) or (min-w/min-h), but it did not. ${printable()}. Classes: ${className}`,
    }
  },

  async toHaveFixedWidth(received: Locator) {
    if (!received || typeof (received as any).evaluate !== 'function') {
      return {
        pass: false,
        message: () => `toHaveFixedWidth can only be used on a Playwright Locator. Received: ${String(received)}`,
      }
    }

    const className = await readClassName(received)
    const tokens = extractSizeTokens(className)

    const widthSet = hasWidthSet(tokens)
    const hasTabularNums = className.split(/\s+/).includes('tabular-nums')

    const pass = widthSet && hasTabularNums
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have fixed width with tabular-nums, but it does. Classes: ${className}`
          : `Expected element to have width or min-width set and include the 'tabular-nums' class.\nClasses: ${className}`,
    }
  },
})
