import type { Locator } from "@playwright/test"

type MatcherResult = { pass: boolean; message: () => string }

export async function toBeHorizontallyCentered(locator: Locator): Promise<MatcherResult> {
  const result = await locator.first().evaluate(el => {
    const children = Array.from(el.children)
    return children.every(child => {
      const parentRect = el.getBoundingClientRect()
      const childRect = child.getBoundingClientRect()
      const parentCenter = parentRect.left + parentRect.width / 2
      const childCenter = childRect.left + childRect.width / 2
      return Math.abs(parentCenter - childCenter) < 1
    })
  })
  return {
    pass: result,
    message: () => result
      ? 'All children are horizontally centered'
      : 'Not all children are horizontally centered in the parent element',
  }
}