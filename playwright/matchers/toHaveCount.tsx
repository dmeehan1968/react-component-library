import type { MatcherReturnType } from "@playwright/test"
import { CounterHelper } from "../../src/components/counter/index.test.helper.tsx"

export async function toHaveCount(counter: CounterHelper, expected: number): Promise<MatcherReturnType> {
  const actual = await counter.count
  const pass = actual === expected
  return {
    actual,
    expected,
    pass,
    message: () =>
      pass
        ? `Expected element not to have count ${expected}, but it has ${actual}.`
        : `Expected element to have count ${expected}, but it has ${actual}.`,
  }
}