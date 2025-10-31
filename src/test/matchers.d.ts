// Type augmentation for custom matchers used in Bun's expect
// This file is included in the application TS program (under src/) so tests get proper types.

declare module 'bun:test' {
  interface Matchers<T = unknown> {
    /**
     * Assert that an HTMLElement has Tailwind width/min-width to height/min-height ratio
     * greater than or equal to the provided value. Checks both (w vs h) and (min-w vs min-h).
     */
    toHaveContainerRatio(this: Matchers<HTMLElement>, ratio: number): void

    /**
     * Assert that an HTMLElement has width or min-width set (via Tailwind class) and also includes
     * the `tabular-nums` class.
     */
    toHaveFixedWidth(this: Matchers<HTMLElement>): void
  }
}

export {}
