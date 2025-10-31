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

  get count() {
    return Number(this.element.getByTestId('count').textContent)
  }

  get countElement() {
    return this.element.getByTestId('value') as HTMLElement
  }

  get incrementBtn() {
    return this.element.getByRole('button', { name: /increment/i })
  }

  get decrementBtn() {
    return this.element.getByRole('button', { name: /decrement/i })
  }

  increment() {
    return this.user.click(this.incrementBtn)
  }

  decrement() {
    return this.user.click(this.decrementBtn)
  }

  unmount() {
    this.element.unmount()
  }
}
