import { describe, expect, it } from 'bun:test'
import { afterEach } from 'node:test'
import { CounterHelper } from './Counter.test.helper.tsx'

// Counter component tests using Bun's test runner + React Testing Library

describe('Counter', () => {
  let counter: CounterHelper

  afterEach(() => {
    counter?.unmount()
  })

  it('increments count on click', async () => {
    counter = new CounterHelper()
    expect(counter.button.textContent).toContain('count is 0')
    await counter.click()
    expect(counter.button.textContent).toContain('count is 1')
    await counter.click()
    expect(counter.button.textContent).toContain('count is 2')
  })
})
