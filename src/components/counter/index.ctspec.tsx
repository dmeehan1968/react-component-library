import { expect as baseExpect, test as baseTest } from '@playwright/experimental-ct-react'
import { CounterHelper } from "./index.ctspec.helper.tsx"
import { toHaveContainerRatio } from "../../../playwright/matchers/toHaveContainerRatio.tsx"
import { toHaveCount } from "../../../playwright/matchers/toHaveCount.tsx"
import { toHaveFixedWidth } from "../../../playwright/matchers/toHaveFixedWidth.tsx"

export const test = baseTest.extend<{ counter: CounterHelper }>({
  counter: async ({ mount }, provide) => {
    const dsl = await CounterHelper.mount(mount)
    await provide(dsl)
  },
})

export const expect = baseExpect.extend({
  toHaveCount,
  toHaveContainerRatio,
  toHaveFixedWidth,
})

test.describe('Counter (Playwright CT)', () => {

  test('shows initial value and increments/decrements correctly', async ({ counter }) => {
    expect(counter).toHaveCount(0)
    await expect(counter.increment()).resolves.toHaveCount(1)
    await expect(counter.increment()).resolves.toHaveCount(2)
    await expect(counter.increment()).resolves.toHaveCount(3)
    await expect(counter.decrement()).resolves.toHaveCount(2)
  })

  test('should style the buttons twice the width as the height', async ({ counter }) => {
    await expect(counter.incrementBtn).toHaveContainerRatio(2)
    await expect(counter.decrementBtn).toHaveContainerRatio(2)
  })

  test('should fix the count value width', async ({ counter }) => {
    await expect(counter.valueElement).toHaveFixedWidth()
  })

  test('should support custom initial value', async ({ counter }) => {
    await counter.update({ initial: 2 })
    await expect(counter).toHaveCount(2)
  })

  test('should support custom step', async ({ counter }) => {
    await counter.update({ step: 2 })
    await expect(counter.increment()).resolves.toHaveCount(2)
  })
})
