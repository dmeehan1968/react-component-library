import { Locator, MatcherReturnType } from "@playwright/test"

export async function toHaveCount(received: unknown, expected: number): Promise<MatcherReturnType> {
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
    if (typeof value === 'object' && value !== null && 'evaluate' in value && typeof (value as {
      evaluate: unknown
    }).evaluate === 'function') {
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
}