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

})
