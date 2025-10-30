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

  it('stabilizes value width and widens equal tap targets', async () => {
    counter = new CounterHelper()

    // Badge has tabular numerals, min width and centered text
    const classes = counter.value.className
    expect(classes).toContain('tabular-nums')
    expect(classes).toContain('min-w-[12ch]')
    expect(classes).toContain('text-center')

    // Buttons have equal square tap target of at least 44x44 (48x48 via w-12 h-12)
    const inc = counter.getButton('increment')
    const dec = counter.getButton('decrement')

    expect(inc.className).toContain('w-12')
    expect(inc.className).toContain('h-12')
    expect(dec.className).toContain('w-12')
    expect(dec.className).toContain('h-12')

    // Basic behavioral check across digit boundary to ensure no errors
    // 9 -> 10
    await counter.setValue(9)
    await counter.increment()
    expect(counter.value.textContent).toContain('count is 10')
    // 99 -> 100
    await counter.setValue(99)
    await counter.increment()
    expect(counter.value.textContent).toContain('count is 100')
  })
})
