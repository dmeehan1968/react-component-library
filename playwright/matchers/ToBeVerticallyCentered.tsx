import type { Locator } from "@playwright/test"

type MatcherResult = { pass: boolean; message: () => string }

export async function toBeVerticallyCentered(locator: Locator): Promise<MatcherResult> {
  const pass = await locator.first().evaluate(el => {
    const children = Array.from(el.children)
    // Calculate the bounding box of all the children, then ensure it's centered
    // vertically within the parent element. Using the union box avoids bias
    // from children with different heights.
    const childRects = children.map(child => child.getBoundingClientRect())
    if (childRects.length === 0) return true
    const parentRect = el.getBoundingClientRect()
    const parentCenter = parentRect.top + parentRect.height / 2
    const minTop = Math.min(...childRects.map(r => r.top))
    const maxBottom = Math.max(...childRects.map(r => r.bottom))
    const childrenBoxCenter = (minTop + maxBottom) / 2
    const EPSILON = 2 // allow minor sub-pixel/layout rounding in CT
    return Math.abs(parentCenter - childrenBoxCenter) <= EPSILON
  })
  return {
    pass,
    message: () => pass
      ? 'All children are vertically centered'
      : 'Not all children are vertically centered in the parent element',
  }
}