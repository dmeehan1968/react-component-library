import { Locator, MatcherReturnType } from "@playwright/test"
import { extractSizeTokens, hasWidthSet, readClassName } from "./toHaveContainerRatio.tsx"

export async function toHaveFixedWidth(received: Locator): Promise<MatcherReturnType> {
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
}