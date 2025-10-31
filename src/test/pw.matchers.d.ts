// Type augmentation for custom matchers used in Playwright's expect
// Kept under src/ so TypeScript picks it up in the project program.

declare module '@playwright/test' {
  interface Matchers<R, T> {
    /** Assert that a Locator resolves to an element whose Tailwind width/min-width to height/min-height
     * ratio is greater than or equal to the provided value. Checks both (w vs h) and (min-w vs min-h).
     */
    toHaveContainerRatio(ratio: number): Promise<R>

    /** Assert that a Locator resolves to an element that has width or min-width set (via Tailwind class)
     * and also includes the `tabular-nums` class.
     */
    toHaveFixedWidth(): Promise<R>
  }
}

export {}
