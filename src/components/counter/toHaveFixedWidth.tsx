import type { Locator, MatcherReturnType } from "@playwright/test"
import { extractSizeTokens, hasWidthSet } from "./toHaveContainerRatio.tsx"

export async function toHaveFixedWidth(locator: Locator): Promise<MatcherReturnType> {
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