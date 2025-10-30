import { render, type RenderResult } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event/dist/cjs/index.js"
import App from "./App.tsx"

export class AppHelper {
  private readonly element: RenderResult
  private readonly user: UserEvent

  constructor() {
    this.element = render(<App/>)
    this.user = userEvent.setup()
  }

  get title() {
    return this.element.getByRole('heading', { name: /vite \+ react/i })
  }

  get docsNote() {
    return this.element.getByText(/learn more/i)
  }

  get counter() {
    return this.element.getByRole('button', { name: /count is/i })
  }

  increment() {
    return this.user.click(this.counter)
  }

  unmount() {
    this.element.unmount()
  }
}