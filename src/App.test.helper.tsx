import { render, type RenderResult } from "@testing-library/react"
import App from "./App.tsx"

export class AppHelper {
  private readonly element: RenderResult

  constructor() {
    this.element = render(<App/>)
  }

  get title() {
    return this.element.getByRole('heading', { name: /vite \+ react/i })
  }

  get docsNote() {
    return this.element.getByText(/learn more/i)
  }

  // For App-level tests we only assert the presence of the counter, not its behavior
  get counters() {
    return this.element.getAllByTestId('counter')
  }

  unmount() {
    this.element.unmount()
  }
}