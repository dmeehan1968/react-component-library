import { test, expect } from '@playwright/experimental-ct-react'
// Ensure custom matchers are registered in the worker even if ctSetup is skipped
import '../../../test/pw.matchers'
import { CounterCTHelper } from './index.ct.helper'

test.describe('Counter (Playwright CT)', () => {
  test('shows initial value and increments/decrements correctly', async ({ mount }) => {
    const counter = await CounterCTHelper.mount(mount)

    expect(await counter.count()).toEqual(0)

    await counter.increment()
    expect(await counter.count()).toEqual(1)

    await counter.increment()
    expect(await counter.count()).toEqual(2)

    await counter.decrement()
    expect(await counter.count()).toEqual(1)

    await counter.unmount()
  })

  test('should style the buttons twice the width as the height', async ({ mount }) => {
    const counter = await CounterCTHelper.mount(mount)

    await expect(counter.incrementBtn).toHaveContainerRatio(2)
    await expect(counter.decrementBtn).toHaveContainerRatio(2)

    await counter.unmount()
  })

  test('should fix the count value width', async ({ mount }) => {
    const counter = await CounterCTHelper.mount(mount)

    await expect(counter.countElement).toHaveFixedWidth()

    await counter.unmount()
  })
})
