import { afterEach, describe, expect, it } from 'bun:test'
import { CounterHelper } from './index.test.helper.tsx'

describe('Counter', () => {
  let counter: CounterHelper

  afterEach(() => {
    counter?.unmount()
  })

  it('shows initial value and increments/decrements correctly', async () => {
    counter = new CounterHelper()
    expect(counter.value.textContent).toContain('count is 0')

    await counter.increment()
    expect(counter.value.textContent).toContain('count is 1')

    await counter.increment()
    expect(counter.value.textContent).toContain('count is 2')

    await counter.decrement()
    expect(counter.value.textContent).toContain('count is 1')
  })
})
