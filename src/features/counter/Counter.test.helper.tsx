import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event/dist/cjs/index.js'
import Counter from './Counter.tsx'

export class CounterHelper {
  private readonly element: RenderResult
  private readonly user: UserEvent

  constructor() {
    this.element = render(<Counter />)
    this.user = userEvent.setup()
  }

  get button() {
    return this.element.getByRole('button')
  }

  click() {
    return this.user.click(this.button)
  }

  unmount() {
    this.element.unmount()
  }
}
