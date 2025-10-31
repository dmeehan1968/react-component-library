import { describe, it, expect } from 'bun:test'

function el(classes: string): HTMLElement {
  const div = document.createElement('div')
  div.className = classes
  return div
}

describe('custom matchers: toHaveContainerRatio', () => {
  it('passes when w/h ratio >= expected (e.g., w-24 h-12 => 2)', () => {
    const node = el('w-24 h-12')
    expect(node).toHaveContainerRatio(1.5)
    expect(node).toHaveContainerRatio(2)
  })

  it('throws for values larger than the computed ratio and reports details', () => {
    const node = el('w-24 h-12')
    expect(() => expect(node).toHaveContainerRatio(2.1)).toThrow(
      /Expected element to have container ratio >= 2\.1.*w\/h: 2\.000/i,
    )
  })

  it('supports min-w/min-h tokens too', () => {
    const node = el('min-w-10 min-h-5')
    expect(node).toHaveContainerRatio(2)
  })

  it('ignores arbitrary width tokens for ratio math (e.g., w-[12ch]) and fails', () => {
    const node = el('w-[12ch] h-10')
    expect(() => expect(node).toHaveContainerRatio(1)).toThrow(/w\/h: n\/a/i)
  })

  it('fails when one of the necessary tokens is missing', () => {
    const node1 = el('w-10')
    const node2 = el('h-10')
    expect(() => expect(node1).toHaveContainerRatio(1)).toThrow(/w\/h: n\/a/i)
    expect(() => expect(node2).toHaveContainerRatio(1)).toThrow(/w\/h: n\/a/i)
  })

  it('throws for non-HTMLElement inputs', () => {
    expect(() => expect(123).toHaveContainerRatio(1)).toThrow(/can only be used on HTMLElement/i)
  })

  it('throws for invalid ratio argument (<= 0, NaN, Infinity)', () => {
    const node = el('w-10 h-10')
    expect(() => expect(node).toHaveContainerRatio(0)).toThrow(/Invalid ratio/i)
    expect(() => expect(node).toHaveContainerRatio(NaN as never)).toThrow(/Invalid ratio/i)
    expect(() => expect(node).toHaveContainerRatio(Infinity as never)).toThrow(/Invalid ratio/i)
  })

  it('exposes a helpful negative assertion message when the condition actually passes', () => {
    const node = el('w-30 h-10') // ratio 3
    expect(() => expect(node).not.toHaveContainerRatio(2)).toThrow(
      /Expected element not to have container ratio >= 2, but it did .*w\/h: 3\.000/i,
    )
  })
})

describe('custom matchers: toHaveFixedWidth', () => {
  it('passes when width is set and tabular-nums is present', () => {
    expect(el('w-10 tabular-nums')).toHaveFixedWidth()
  })

  it('passes for min-w arbitrary tokens too (e.g., min-w-[12ch])', () => {
    expect(el('min-w-[12ch] tabular-nums')).toHaveFixedWidth()
  })

  it('fails when tabular-nums is missing', () => {
    expect(() => expect(el('w-10')).toHaveFixedWidth()).toThrow(/Expected element to have width or min-width set and include the 'tabular-nums' class/i)
  })

  it('fails when width is not set', () => {
    expect(() => expect(el('tabular-nums')).toHaveFixedWidth()).toThrow(/Expected element to have width or min-width set/i)
  })

  it('throws for non-HTMLElement inputs', () => {
    expect(() => expect('oops').toHaveFixedWidth()).toThrow(/can only be used on HTMLElement/i)
  })

  it('exposes a helpful negative assertion message when the condition actually passes', () => {
    expect(() => expect(el('w-12 tabular-nums')).not.toHaveFixedWidth()).toThrow(
      /Expected element not to have fixed width with tabular-nums, but it does\./i,
    )
  })
})
