import { expect } from 'bun:test'

type TWSize = {
  kind: 'w' | 'min-w' | 'h' | 'min-h'
  token: string
}

// Simple Tailwind width/height token parser.
// Supports numeric tokens (e.g., w-24, h-12) and arbitrary values (e.g., min-w-[12ch]).
// For ratio math, we only use numeric tokens; arbitrary values are treated as unknown numeric value.
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
  // Accept integers like 12, 24. Ignore fractions/keywords/full/auto/screen/etc.
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
  // We compare token numbers directly (Tailwind spacing scale is linear, scale factor cancels out)
  return w / h
}

function hasWidthSet(tokens: TWSize[]): boolean {
  // Consider any w-* or min-w-* as width set, including arbitrary (w-[...])
  return tokens.some((t) => t.kind === 'w' || t.kind === 'min-w')
}

expect.extend({
  toHaveContainerRatio(received: unknown, ratio: number) {
    if (!(received instanceof HTMLElement)) {
      return {
        pass: false,
        message: () => `toHaveContainerRatio can only be used on HTMLElement. Received: ${String(received)}`,
      }
    }

    if (!isFinite(ratio) || ratio <= 0) {
      return {
        pass: false,
        message: () => `Invalid ratio: ${String(ratio)}. Ratio must be a positive finite number.`,
      }
    }

    const className = received.className ?? ''
    const tokens = extractSizeTokens(className)

    const ratios: Array<{ label: string; value: number | null }> = [
      { label: 'w/h', value: computeRatioFromTokens(tokens, 'w', 'h') },
      { label: 'min-w/min-h', value: computeRatioFromTokens(tokens, 'min-w', 'min-h') },
    ]

    const match = ratios.find((r) => r.value != null && (r.value as number) >= ratio)

    const pass = Boolean(match)
    const printable = () => {
      const details = ratios
        .map((r) => `${r.label}: ${r.value == null ? 'n/a' : r.value.toFixed(3)}`)
        .join(', ')
      return `${details}`
    }

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have container ratio >= ${ratio}, but it did (${printable()}).`
          : `Expected element to have container ratio >= ${ratio} using either (w/h) or (min-w/min-h), but it did not. ${printable()}.Classes: ${className}`,
    }
  },

  toHaveFixedWidth(received: unknown) {
    if (!(received instanceof HTMLElement)) {
      return {
        pass: false,
        message: () => `toHaveFixedWidth can only be used on HTMLElement. Received: ${String(received)}`,
      }
    }

    const className = received.className ?? ''
    const tokens = extractSizeTokens(className)

    const widthSet = hasWidthSet(tokens)
    const hasTabularNums = className.split(/\s+/).includes('tabular-nums')

    const pass = widthSet && hasTabularNums
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have fixed width with tabular-nums, but it does. Classes: ${className}`
          : `Expected element to have width or min-width set and include the 'tabular-nums' class.
Classes: ${className}`,
    }
  },
})