import { expect as baseExpect, test as baseTest } from '@playwright/experimental-ct-react'
import { Locator } from "@playwright/test"

import Counter from "./index"

class CounterDSL {
  private readonly countNode: Locator
  readonly countElement: Locator
  readonly incrementBtn: Locator
  readonly decrementBtn: Locator

  constructor(root: Locator) {
    this.countNode = root.getByTestId('count')
    this.countElement = root.getByTestId('value')
    this.incrementBtn = root.getByRole('button', { name: /increment/i })
    this.decrementBtn = root.getByRole('button', { name: /decrement/i })
  }

  private readCount = async (): Promise<number> => {
    const txt = await this.countNode.textContent()
    return Number(txt)
  }

  // Thenable function properties so `expect(counter.increment).resolves` works
  increment = (() => {
    const fn = async () => {
        await this.incrementBtn.click()
        return await this.readCount()
      }
    const thenable = fn as (typeof fn) & PromiseLike<number>
    (thenable as unknown as { then: PromiseLike<number>['then'] }).then = ((onfulfilled?: (value: number) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(fn()).then(onfulfilled, onrejected)) as PromiseLike<number>['then']
    return thenable
  })()

  decrement = (() => {
    const fn = async () => {
        await this.decrementBtn.click()
        return await this.readCount()
      }
    const thenable = fn as (typeof fn) & PromiseLike<number>
    (thenable as unknown as { then: PromiseLike<number>['then'] }).then = ((onfulfilled?: (value: number) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(fn()).then(onfulfilled, onrejected)) as PromiseLike<number>['then']
    return thenable
  })()
}

export const test = baseTest.extend<{ counter: CounterDSL }>({
  counter: async ({ mount }, provide) => {
    const mounted = await mount(<Counter />)
    const dsl = new CounterDSL(mounted)
    await provide(dsl)
    await mounted.unmount()
  },
})

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

export const expect = baseExpect.extend({
  async toHaveCount(received: unknown, expected: number) {
    if (!Number.isFinite(expected))
      return {
        pass: false,
        message: () => `toHaveCount expected value must be a finite number. Received: ${String(expected)}`,
      }

    // Helper to coerce different inputs into a number
    const readCount = async (value: unknown): Promise<number | null> => {
      // Already a number
      if (typeof value === 'number') return value

      // Promise-like<number>
      if (typeof value === 'object' && value !== null && 'then' in value && typeof (value as PromiseLike<unknown>).then === 'function') {
        try {
          const v = await (value as Promise<unknown>)
          return typeof v === 'number' ? v : await readCount(v)
        } catch {
          return null
        }
      }

      // Playwright Locator -> try inner [data-testid="count"], else textContent of the locator itself
      if (typeof value === 'object' && value !== null && 'evaluate' in value && typeof (value as { evaluate: unknown }).evaluate === 'function') {
        const locator = value as Locator
        const inner = locator.getByTestId('count').first()
        const hasInner = (await locator.getByTestId('count').count().catch(() => 0)) > 0
        const target = hasInner ? inner : locator.first()
        const txt = await target.textContent()
        const num = txt != null ? Number(txt) : NaN
        return Number.isFinite(num) ? num : null
      }

      // Function that returns a promise/number
      if (typeof value === 'function') {
        try {
          const out = (value as () => unknown)()
          return await readCount(out)
        } catch {
          return null
        }
      }

      return null
    }

    const actual = await readCount(received)
    const pass = actual === expected
    return {
      pass,
      message: () =>
        pass
          ? `Expected count not to be ${expected}, but it was.`
          : `Expected count to be ${expected}, but received ${actual === null ? 'unreadable' : actual}.`,
    }
  },
  async toHaveContainerRatio(received: Locator, ratio: number) {
    if (
      !received ||
      typeof received !== 'object' || !('evaluate' in (received as object)) ||
      typeof (received as { evaluate: unknown }).evaluate !== 'function'
    ) {
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
    if (
      !received ||
      typeof received !== 'object' || !('evaluate' in (received as object)) ||
      typeof (received as { evaluate: unknown }).evaluate !== 'function'
    ) {
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

test.describe('Counter (Playwright CT)', () => {
  test('shows initial value and increments/decrements correctly', async ({ counter }) => {
    await expect(counter.increment).resolves.toHaveCount(1)
    await expect(counter.increment).resolves.toHaveCount(2)
    await expect(counter.increment).resolves.toHaveCount(3)
    await expect(counter.decrement).resolves.toHaveCount(2)
  })

  test('should style the buttons twice the width as the height', async ({ counter }) => {
    await expect(counter.incrementBtn).toHaveContainerRatio(2)
    await expect(counter.decrementBtn).toHaveContainerRatio(2)
  })

  test('should fix the count value width', async ({ counter }) => {
    await expect(counter.countElement).toHaveFixedWidth()
  })
})
