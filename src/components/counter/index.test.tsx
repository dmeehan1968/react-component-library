import { afterEach, describe, expect, it } from 'bun:test'
import { CounterHelper } from './index.test.helper.tsx'

describe('Counter', () => {
  let counter: CounterHelper

  afterEach(() => {
    counter?.unmount()
  })

  it('shows initial value and increments/decrements correctly', async () => {
    counter = new CounterHelper()
    expect(counter.count).toEqual(0)

    await counter.increment()
    expect(counter.count).toEqual(1)

    await counter.increment()
    expect(counter.count).toEqual(2)

    await counter.decrement()
    expect(counter.count).toEqual(1)
  })

  it('should style the buttons twice the width as the height', async () => {
    counter = new CounterHelper()

    expect(counter.incrementBtn).toHaveContainerRatio(2)
    expect(counter.decrementBtn).toHaveContainerRatio(2)
  })

  it('should fix the count value width', async () => {
    counter = new CounterHelper()

    expect(counter.countElement).toHaveFixedWidth()
  })

})
