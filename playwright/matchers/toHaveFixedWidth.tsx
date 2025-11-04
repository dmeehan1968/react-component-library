import type { Locator } from "@playwright/test"
import { extractSizeTokens, hasWidthSet } from "./toHaveContainerRatio.tsx"

type MatcherResult = { pass: boolean; message: () => string }

export async function toHaveFixedWidth(locator: Locator): Promise<MatcherResult> {
  const className = await locator.getAttribute('class') ?? ''
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
}