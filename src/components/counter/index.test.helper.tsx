import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event/dist/cjs/index.js'
import Counter from './index.tsx'

export class CounterHelper {
  private readonly element: RenderResult
  private readonly user: UserEvent

  constructor() {
    this.element = render(<Counter />)
    this.user = userEvent.setup()
  }

  get value() {
    return this.element.getByTestId('value')
  }

  getButton(name: 'increment' | 'decrement') {
    return this.element.getByRole('button', { name })
  }

  async setValue(n: number) {
    // Get current value from text content and click diff times
    const text = this.value.textContent ?? ''
    const match = text.match(/(-?\d+)/)
    const current = match ? parseInt(match[1], 10) : 0
    let diff = n - current
    while (diff !== 0) {
      if (diff > 0) {
        await this.increment()
        diff--
      } else {
        await this.decrement()
        diff++
      }
    }
  }

  increment() {
    return this.user.click(this.element.getByRole('button', { name: /increment/i }))
  }

  decrement() {
    return this.user.click(this.element.getByRole('button', { name: /decrement/i }))
  }

  unmount() {
    this.element.unmount()
  }
}
